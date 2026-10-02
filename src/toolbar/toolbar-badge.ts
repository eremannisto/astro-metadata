// The toolbar draws the notification badge of each app. These rules change only our badge:
// no border and a lighter color. Instead of the border, a mask cuts a gap in the shape of the
// badge out of our icon, so the real background (a gradient) shows around the badge.
// The selectors depend on the toolbar markup of Astro. They start with the same IDs as the
// rules of Astro, so they have a higher specificity and win without !important.
const APP = '#dev-bar #bar-container .item[data-app-id="mannisto-astro-metadata"]'

// The shapes of the badges of Astro.
// The shapes are in the coordinates of their own 10 px badge box.
const BADGE_SHAPES = {
  warning:
    '<path d="M7.29904 1.25c-.57735-1-2.02073-1-2.59808 0l-3.4641 6C.65951 8.25 1.3812 9.5 2.5359 9.5h6.9282c1.1547 0 1.8764-1.25 1.299-2.25l-3.46406-6Z"/>',
  error: '<rect width="9" height="9" x=".5" y=".5" rx="4.5"/>',
  info: '<rect width="9" height="9" x=".5" y=".5" rx="1.5"/>',
}

// The position of the badge box, in px from the top and the right edge of the 20 px icon.
// Astro uses top -4 and right -6. Smaller values move the badge closer to the icon.
const BADGE_TOP = -4
const BADGE_RIGHT = -6

// The width of the gap around the badge, in px: the same as the line of the icon on screen.
// The icon (Phosphor, Bold weight) has a 24 unit line in a 256 unit grid,
// and the toolbar shows it at 20 px.
const BADGE_GAP = 24 * (20 / 256)

/**
 * Returns a CSS mask image: the full icon, with a hole in the shape of a badge.
 */
function badgeMask(shape: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
    <mask id="m">
      <rect width="20" height="20" fill="white"/>
      <g transform="translate(${10 - BADGE_RIGHT} ${BADGE_TOP})" fill="black" stroke="black" stroke-width="${BADGE_GAP * 2}" stroke-linejoin="round">${shape}</g>
    </mask>
    <rect width="20" height="20" mask="url(#m)"/>
  </svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

// The badge is in the shadow root of the Astro toolbar, where the design values of the
// panel do not reach. So its colors are the hex codes of the Tailwind values.
const BADGE_STYLE = `
  ${APP} .notification {
    top: ${BADGE_TOP}px;
    right: ${BADGE_RIGHT}px;
  }
  ${APP} .notification svg :is(path, rect) {
    stroke: none;
  }
  ${APP} .notification[data-level="warning"] path {
    fill: #facc15; /* yellow-400 */
  }
  ${APP} .notification[data-level="error"] rect {
    fill: #ef4444; /* red-500 */
  }
  ${Object.entries(BADGE_SHAPES)
    .map(([level, shape]) => {
      return `
        #dev-toolbar-root:not([data-no-notification]) ${APP} .icon:has(.notification[data-active][data-level="${level}"]) > svg {
          mask: ${badgeMask(shape)} center / 100% 100% no-repeat;
        }`
    })
    .join("")}
`

/**
 * Adds the badge style to the shadow root of the Astro toolbar, one time.
 */
export function styleBadge(): void {
  const root = document.querySelector("astro-dev-toolbar")?.shadowRoot
  if (!root || root.getElementById("mannisto-astro-metadata-badge")) return

  const style = document.createElement("style")
  style.id = "mannisto-astro-metadata-badge"
  style.textContent = BADGE_STYLE
  root.append(style)
}
