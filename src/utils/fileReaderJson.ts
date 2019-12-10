export function fileReaderJson<T>(file: File): Promise<T> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsText(file);

    reader.onload = (event) => {
      const result = event.target.result as string;
      const json = JSON.parse(result);
      resolve(json);
    };
  });
}
