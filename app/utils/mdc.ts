import type { InjectionKey } from 'vue'

/** Provided by `::code-group` so nested code blocks drop their own header/frame. */
export const codeGroupKey: InjectionKey<boolean> = Symbol('mdc-code-group')

/** `/foo`, `#bar` → internal; `https://…`, `mailto:` → external. */
export function isExternalUrl(url: string | undefined | null): boolean {
  return Boolean(url && /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(url))
}
