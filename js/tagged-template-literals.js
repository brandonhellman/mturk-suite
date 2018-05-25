/* eslint-disable no-unused-vars */

function HTML(strings, ...expressions) {
  return strings
    .map((string, i) => {
      const expression = expressions[i] !== undefined ? expressions[i] : ``;
      const nullToString = expression === null ? `null` : expression;
      const newExpression = nullToString
        .toString()
        .replace(/&/g, `&amp;`)
        .replace(/</g, `&lt;`)
        .replace(/>/g, `&gt;`)
        .replace(/"/g, `&quot;`)
        .replace(/'/g, `&#039;`);

      return string + newExpression;
    })
    .join(``);
}

function ENCODE(strings, ...expressions) {
  return strings
    .map(
      (string, i) =>
        string +
        encodeURIComponent(expressions[i] !== undefined ? expressions[i] : ``)
    )
    .join(``);
}
