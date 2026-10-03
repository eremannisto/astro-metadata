import { html, LitElement, nothing, unsafeCSS } from "lit"

import { define } from "../../define.ts"

import "../icon/icon.ts"

import { code } from "../inline-code/inline-code.ts"
import styles from "./table.css?inline"

/**
 * A row of a table: a label and a value. A row without a value shows "none".
 */
export type TableRow = {
  label: string
  /** A key to find the row, e.g. "og:title". `highlight()` uses it. */
  key?: string
  value?: unknown
  /** A short note in a third column, e.g. the length of a text: "30 / 60". */
  note?: string
  /** The color of the note: "near" a limit (yellow), or "over" it (orange). */
  noteLevel?: "near" | "over"
  /** Shows the label as code, e.g. a tag name such as "og:title". */
  labelCode?: boolean
  /** Rows under this row. A click on the label opens and closes them. */
  children?: TableRow[]
}

/**
 * A table of labels and values.
 *
 * @example <astro-metadata-table .rows=${[{ label: "Title", value: title }]}></astro-metadata-table>
 */
export class Table extends LitElement {
  static properties = {
    rows: { attribute: false },
    opened: { state: true },
  }
  static styles = unsafeCSS(styles)

  declare rows: TableRow[]
  /** The indexes of the open rows. */
  declare opened: Set<number>

  constructor() {
    super()
    this.rows = []
    this.opened = new Set()
  }

  /**
   * Scrolls to the row with a key and marks it for a moment. Each call starts the mark again,
   * also while the mark of an earlier call still shows.
   *
   * @returns False when the table has no row with the key.
   */
  async highlight(key: string): Promise<boolean> {
    await this.updateComplete
    const row = [...this.renderRoot.querySelectorAll<HTMLElement>("tr[data-key]")].find(
      (element) => {
        return element.dataset.key === key
      }
    )
    if (!row) return false

    row.scrollIntoView({ block: "center", behavior: "smooth" })
    const color = getComputedStyle(this).getPropertyValue("--blue-900")
    for (const cell of row.querySelectorAll("th, td")) {
      cell.animate([{ background: color }, { background: "transparent" }], {
        duration: 1600,
        easing: "ease-out",
      })
    }
    return true
  }

  renderValue(row: TableRow) {
    if (row.value === undefined || row.value === null || row.value === "") {
      return html`<span class="empty">none</span>`
    }
    return row.value
  }

  toggle(index: number): void {
    const opened = new Set(this.opened)
    if (opened.has(index)) opened.delete(index)
    else opened.add(index)
    this.opened = opened
  }

  renderLabel(row: TableRow, index: number) {
    const label = row.labelCode ? code(row.label) : row.label
    if (!row.children?.length) return label

    const open = this.opened.has(index)
    return html`
      <button
        class="toggle ${open ? "open" : ""}"
        aria-expanded=${open}
        @click=${() => {
          this.toggle(index)
        }}
      >
        <astro-metadata-icon name="caret-right"></astro-metadata-icon>
        ${label}
      </button>
    `
  }

  renderRow(row: TableRow, label: unknown, notes: boolean, child: boolean) {
    return html`
      <tr class=${child ? "child" : ""} data-key=${row.key ?? nothing}>
        <th>${label}</th>
        <td>${this.renderValue(row)}</td>
        ${
          notes
            ? html`<td class="note ${row.noteLevel ?? ""}">${row.note ?? nothing}</td>`
            : nothing
        }
      </tr>
    `
  }

  render() {
    // The third column only shows in a table with notes
    const all = this.rows.flatMap((row) => {
      return [row, ...(row.children ?? [])]
    })
    const notes = all.some((row) => {
      return row.note
    })

    return html`
      <table>
        ${this.rows.map((row, index) => {
          const children = this.opened.has(index) ? (row.children ?? []) : []
          return html`
            ${this.renderRow(row, this.renderLabel(row, index), notes, false)}
            ${children.map((child) => {
              return this.renderRow(
                child,
                child.labelCode ? code(child.label) : child.label,
                notes,
                true
              )
            })}
          `
        })}
      </table>
    `
  }
}

define("astro-metadata-table", Table)
