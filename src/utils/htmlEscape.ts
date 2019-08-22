export function htmlEscape(literals: TemplateStringsArray, ...placeholders: any[]) {
  return literals
    .map((literal, i) => {
      const expression = placeholders[i] !== undefined ? placeholders[i] : '';
      const nullToString = expression === null ? 'null' : expression;
      const newExpression = nullToString
        .toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

      return literal + newExpression;
    })
    .join('');
}
