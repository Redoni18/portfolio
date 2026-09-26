/**
 * Turns a Nuxt Content body back into plain markdown for the agent files
 * (llms.txt, llms-full.txt and each page's .md copy).
 *
 * The raw .md sources aren't used because they're full of MDC syntax
 * (`::link-card{…}`, `:figure{…}`) that means nothing outside this site. The
 * parsed body has every component resolved to a tag with props, so each one is
 * written out here as what it shows: a link card as a link, a figure as an
 * image with its caption, a callout as a quote, a Mermaid diagram as a
 * ```mermaid block. Links are made absolute so they still work when the
 * markdown is read somewhere else.
 */

/** Nuxt Content's compact body format: `[tag, props, ...children]`, or text. */
type MinimarkNode = string | [string, Record<string, unknown>, ...MinimarkNode[]]

/** The same tree in MDC's AST shape, which some Nuxt Content versions return instead. */
interface MdcNode {
  type: string
  tag?: string
  value?: string
  props?: Record<string, unknown>
  children?: MdcNode[]
}

interface Context {
  siteUrl: string
  /** Absolute URL of the page being rendered, for `#anchor` links */
  pageUrl: string
}

const INLINE_TAGS = new Set([
  'a', 'abbr', 'b', 'br', 'code', 'del', 'em', 'i', 'img', 'input', 'kbd', 'mark', 's', 'small', 'span', 'strong', 'sub', 'sup', 'u',
])

/** Rendered as nothing: highlighter styles and the like. */
const SKIPPED_TAGS = new Set(['style', 'script'])

/** Markdown for a page body (`page.body` from queryCollection). */
export function bodyToMarkdown(body: unknown, ctx: Context): string {
  return blocks(toMinimark(body), ctx).join('\n\n')
}

/** Resolve a site-relative link (`/projects`, `#heading`) to an absolute URL. */
export function absoluteUrl(href: string, ctx: Context): string {
  if (href.startsWith('#')) return `${ctx.pageUrl}${href}`
  if (href.startsWith('/') && !href.startsWith('//')) return `${ctx.siteUrl}${href}`
  return href
}

function toMinimark(body: unknown): MinimarkNode[] {
  if (!body || typeof body !== 'object') return []
  const root = body as { type?: string, value?: unknown, children?: unknown }
  if (root.type === 'minimark' && Array.isArray(root.value)) return root.value as MinimarkNode[]
  if (root.type === 'root' && Array.isArray(root.children)) return (root.children as MdcNode[]).map(fromMdc).filter(node => node !== null)
  return []
}

function fromMdc(node: MdcNode): MinimarkNode | null {
  if (node.type === 'text') return node.value ?? ''
  if (node.type !== 'element' || !node.tag) return null
  return [node.tag, node.props ?? {}, ...(node.children ?? []).map(fromMdc).filter(child => child !== null)]
}

function isInline(node: MinimarkNode): boolean {
  return typeof node === 'string' || INLINE_TAGS.has(node[0])
}

/** Block-level markdown for a list of nodes, one string per block. Runs of inline nodes become a paragraph. */
function blocks(nodes: MinimarkNode[], ctx: Context): string[] {
  const out: string[] = []
  let run: MinimarkNode[] = []
  const flush = () => {
    const text = inline(run, ctx).trim()
    if (text) out.push(text)
    run = []
  }
  for (const node of nodes) {
    if (isInline(node)) {
      run.push(node)
      continue
    }
    flush()
    const text = block(node as Exclude<MinimarkNode, string>, ctx)
    if (text.trim()) out.push(text)
  }
  flush()
  return out
}

function block([tag, props, ...children]: Exclude<MinimarkNode, string>, ctx: Context): string {
  if (SKIPPED_TAGS.has(tag)) return ''

  const heading = /^h([1-6])$/.exec(tag)
  if (heading) return `${'#'.repeat(Number(heading[1]))} ${inline(children, ctx).trim()}`

  switch (tag) {
    case 'p':
      return inline(children, ctx).trim()
    case 'ul':
    case 'ol':
      return list(tag === 'ol', props, children, ctx)
    case 'pre':
      return codeBlock(props, children)
    case 'blockquote':
      return quote(blocks(children, ctx).join('\n\n'))
    case 'hr':
      return '---'
    case 'table':
      return table(children, ctx)
    case 'figure':
      return figure(props, ctx)
    case 'link-card': {
      const link = `[${String(props.title ?? props.to)}](${absoluteUrl(String(props.to ?? ''), ctx)})`
      return props.description ? `${link}: ${String(props.description)}` : link
    }
    case 'callout': {
      const type = String(props.type ?? 'note')
      const title = props.title ? String(props.title) : type.charAt(0).toUpperCase() + type.slice(1)
      return quote([`**${title}**`, ...blocks(children, ctx)].join('\n\n'))
    }
    case 'video': {
      const link = `[Video${props.caption ? `: ${String(props.caption)}` : ''}](${absoluteUrl(String(props.src ?? ''), ctx)})`
      return link
    }
    case 'stat':
      return `**${String(props.value ?? '')}** ${String(props.label ?? '')}`.trim()
    default:
      // Containers (gallery, steps, stat-grid, code-group, mermaid, div…) show their children
      return blocks(children, ctx).join('\n\n')
  }
}

function inline(nodes: MinimarkNode[], ctx: Context): string {
  return nodes.map(node => inlineNode(node, ctx)).join('')
}

function inlineNode(node: MinimarkNode, ctx: Context): string {
  if (typeof node === 'string') return node.replace(/\s*\n\s*/g, ' ')
  const [tag, props, ...children] = node
  if (SKIPPED_TAGS.has(tag)) return ''
  const inner = () => inline(children, ctx)
  switch (tag) {
    case 'strong':
    case 'b':
      return `**${inner()}**`
    case 'em':
    case 'i':
      return `*${inner()}*`
    case 'del':
    case 's':
      return `~~${inner()}~~`
    case 'code':
    case 'kbd':
      return codeSpan(textOf(children))
    case 'a': {
      const href = absoluteUrl(String(props.href ?? ''), ctx)
      const text = inner().trim()
      return text ? `[${text}](${href})` : `<${href}>`
    }
    case 'br':
      return '\n'
    case 'img':
      return `![${String(props.alt ?? '')}](${absoluteUrl(String(props.src ?? ''), ctx)})`
    case 'input':
      return props.type === 'checkbox' ? (props.checked ? '[x] ' : '[ ] ') : ''
    case 'figure':
      return figure(props, ctx)
    default:
      return inner()
  }
}

function textOf(nodes: MinimarkNode[]): string {
  return nodes.map(node => typeof node === 'string' ? node : textOf(node.slice(2) as MinimarkNode[])).join('')
}

function codeSpan(text: string): string {
  const longestRun = Math.max(0, ...(text.match(/`+/g) ?? []).map(run => run.length))
  const fence = '`'.repeat(longestRun + 1)
  const pad = text.startsWith('`') || text.endsWith('`') ? ' ' : ''
  return `${fence}${pad}${text}${pad}${fence}`
}

function codeBlock(props: Record<string, unknown>, children: MinimarkNode[]): string {
  const code = String(props.code ?? textOf(children)).replace(/\n+$/, '')
  const longestRun = Math.max(0, ...(code.match(/`{3,}/g) ?? []).map(run => run.length))
  const fence = '`'.repeat(Math.max(3, longestRun + 1))
  const file = props.filename ? `File: ${codeSpan(String(props.filename))}\n\n` : ''
  return `${file}${fence}${String(props.language ?? '')}\n${code}\n${fence}`
}

function list(ordered: boolean, props: Record<string, unknown>, children: MinimarkNode[], ctx: Context): string {
  const start = Number(props.start ?? 1) || 1
  const items = children.filter((child): child is Exclude<MinimarkNode, string> => typeof child !== 'string' && child[0] === 'li')
  return items.map((item, index) => {
    const marker = ordered ? `${start + index}. ` : '- '
    const indent = ' '.repeat(marker.length)
    // Keep lists tight: a nested list follows its item's text on the next line
    const content = blocks(item.slice(2) as MinimarkNode[], ctx)
      .map((part, i) => i === 0 ? part : (/^(?:[-*]|\d+\.) /.test(part) ? `\n${part}` : `\n\n${part}`))
      .join('')
    return marker + content.split('\n').map((line, i) => i === 0 || !line ? line : indent + line).join('\n')
  }).join('\n')
}

function table(children: MinimarkNode[], ctx: Context): string {
  const rows: string[][] = []
  const collect = (nodes: MinimarkNode[]) => {
    for (const node of nodes) {
      if (typeof node === 'string') continue
      if (node[0] === 'tr') {
        rows.push((node.slice(2) as MinimarkNode[])
          .filter((cell): cell is Exclude<MinimarkNode, string> => typeof cell !== 'string' && (cell[0] === 'th' || cell[0] === 'td'))
          .map(cell => inline(cell.slice(2) as MinimarkNode[], ctx).trim().replace(/\|/g, '\\|').replace(/\n/g, ' ')))
      }
      else {
        collect(node.slice(2) as MinimarkNode[])
      }
    }
  }
  collect(children)
  const [head, ...body] = rows
  if (!head) return ''
  const line = (cells: string[]) => `| ${head.map((_, i) => cells[i] ?? '').join(' | ')} |`
  return [line(head), `| ${head.map(() => '---').join(' | ')} |`, ...body.map(line)].join('\n')
}

function figure(props: Record<string, unknown>, ctx: Context): string {
  const image = `![${String(props.alt ?? '')}](${absoluteUrl(String(props.src ?? ''), ctx)})`
  return props.caption ? `${image}\n*${String(props.caption)}*` : image
}

function quote(text: string): string {
  return text.split('\n').map(line => line ? `> ${line}` : '>').join('\n')
}
