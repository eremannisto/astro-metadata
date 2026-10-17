import type { CSSResult, TemplateResult } from "lit"

import type { SharedPage } from "./page.ts"

/**
 * A platform that shows a link preview, e.g. Google or Discord. To add a platform,
 * add a module with a `Platform` object, and add it to the list in `previews-view.ts`.
 */
export type Platform = {
  name: string
  /** The CSS of the preview. The colors are the dark mode colors of the platform. */
  styles: CSSResult
  render(page: SharedPage): TemplateResult
}
