/**
 * Monochrome Mermaid theme built from the site's shadcn Neutral tokens
 * (app/assets/css/main.css). Mermaid derives colours with khroma, which can't
 * read CSS variables or oklch(), so the token values are mirrored here as hex.
 *
 *   token               light      dark
 *   --background        #ffffff    #0a0a0a
 *   --foreground        #0a0a0a    #fafafa
 *   --muted             #f5f5f5    #262626
 *   --muted-foreground  #737373    #a3a3a3
 *   node border         #d4d4d4    #404040   (--border strengthened one step so
 *                                             it reads against the muted fill)
 */
const PALETTES = {
  light: { bg: '#ffffff', fg: '#0a0a0a', muted: '#f5f5f5', mutedFg: '#737373', border: '#d4d4d4' },
  dark: { bg: '#0a0a0a', fg: '#fafafa', muted: '#262626', mutedFg: '#a3a3a3', border: '#404040' },
} as const

export const MERMAID_FONT = 'Geist, ui-sans-serif, system-ui, -apple-system, sans-serif'

export function mermaidThemeVariables(mode: 'light' | 'dark'): Record<string, string | boolean> {
  const c = PALETTES[mode]
  return {
    darkMode: mode === 'dark',
    fontFamily: MERMAID_FONT,
    fontSize: '14px',
    background: c.bg,
    // The base theme adds a soft drop shadow to nodes (a glow in dark mode). Flat only.
    dropShadow: 'none',

    // Nodes
    primaryColor: c.muted,
    primaryTextColor: c.fg,
    primaryBorderColor: c.border,
    secondaryColor: c.muted,
    secondaryTextColor: c.fg,
    secondaryBorderColor: c.border,
    tertiaryColor: c.bg,
    tertiaryTextColor: c.fg,
    tertiaryBorderColor: c.border,
    mainBkg: c.muted,
    nodeBorder: c.border,
    nodeTextColor: c.fg,
    textColor: c.fg,
    titleColor: c.fg,
    clusterBkg: c.bg,
    clusterBorder: c.border,

    // Edges: muted lines, labels sitting on the page background
    lineColor: c.mutedFg,
    edgeLabelBackground: c.bg,
    labelBackgroundColor: c.bg,

    // State diagrams
    transitionColor: c.mutedFg,
    transitionLabelColor: c.fg,
    stateLabelColor: c.fg,
    stateBkg: c.muted,
    labelColor: c.fg,
    specialStateColor: c.fg,
    innerEndBackground: c.fg,
    compositeBackground: c.bg,
    compositeTitleBackground: c.muted,
    altBackground: c.muted,

    // Sequence diagrams
    actorBkg: c.muted,
    actorBorder: c.border,
    actorTextColor: c.fg,
    actorLineColor: c.mutedFg,
    signalColor: c.mutedFg,
    signalTextColor: c.fg,
    labelBoxBkgColor: c.muted,
    labelBoxBorderColor: c.border,
    labelTextColor: c.fg,
    loopTextColor: c.fg,
    noteBkgColor: c.bg,
    noteBorderColor: c.border,
    noteTextColor: c.fg,
    activationBkgColor: c.muted,
    activationBorderColor: c.border,
    sequenceNumberColor: c.bg,
  }
}
