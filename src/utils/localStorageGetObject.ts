export default function localStorageGetObject<T>(key: string, object: T): T {
  const value = localStorage.getItem(key);

  if (value !== null) {
    return { ...object, ...JSON.parse(value) };
  }

  return object;
}
