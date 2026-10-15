/** Vite embeds the original image bytes for portable, self-contained packet exports. */
declare module '*.png?inline' {
  const dataUrl: string;
  export default dataUrl;
}
