// Vite imports: a CSS file as a string, and an SVG file as its source
declare module "*.css?inline" {
  const css: string
  export default css
}

declare module "*.svg?raw" {
  const svg: string
  export default svg
}
