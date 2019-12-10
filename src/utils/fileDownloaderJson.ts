export function fileDownloaderJson(name: string, json: object) {
  const data = JSON.stringify(json, undefined, 2);

  const download = document.createElement('a');
  download.href = window.URL.createObjectURL(new Blob([data], { type: 'application/json' }));
  download.download = `${name}.json`;

  document.body.appendChild(download);
  download.click();
  document.body.removeChild(download);
}
