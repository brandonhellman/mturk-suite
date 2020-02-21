export default function localStorageSetObject(key: string, object: object) {
  localStorage.setItem(key, JSON.stringify(object));
}
