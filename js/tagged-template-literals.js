/* eslint-disable no-unused-vars */

function HTML(strings, ...expressions) {
  return strings
    .map((string, i) => {
      const expression = (expressions[i] || ``)
        .toString()
        .replace(/&/g, `&amp;`)
        .replace(/</g, `&lt;`)
        .replace(/>/g, `&gt;`)
        .replace(/"/g, `&quot;`)
        .replace(/'/g, `&#039;`);

      return string + expression;
    })
    .join(``);
}

function ENCODE(strings, ...expressions) {
  return strings
    .map((string, i) => {
      const expression = (expressions[i] || ``).toString();
      return string + encodeURIComponent(expression);
    })
    .join(``);
}
