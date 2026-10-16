// localStorage that never throws. Browsers with site data blocked (or a
// sandboxed iframe) throw on any access, which must not stop the game loading.

export function storeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function storeSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage blocked or full: the setting just isn't remembered */
  }
}
