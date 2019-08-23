export function urlEscape(literals: TemplateStringsArray, ...placeholders: any[]) {
  return literals
    .map((literal, i) => literal + encodeURIComponent(placeholders[i] !== undefined ? placeholders[i] : ``))
    .join(``);
}
