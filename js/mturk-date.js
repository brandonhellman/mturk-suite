// eslint-disable-next-line no-unused-vars
function MturkDate(offset = 0) {
  const date = new Date(Date.now() - offset);

  const toPST = date.toLocaleString(`en-US`, {
    timeZone: `America/Los_Angeles`
  });

  const isPST = new Date(toPST);
  const yyyy = isPST.getFullYear();
  const mm = `0${isPST.getMonth() + 1}`.slice(-2);
  const dd = `0${isPST.getDate()}`.slice(-2);

  return `${yyyy}${mm}${dd}`;
}
