// @author: gold
// 2021 AD
//
// Note: Store stuff in memory, with or without a timeout. It can be used in a
// browser or a server; it does not interact with a browser's localStorage
// mechanism.

interface LootBagItem {
  v: any,
  t: number,
  kt: number | null
}

class TTLStorage {
  _lootBag: Record<string, LootBagItem>
  _timeout: null | number

  constructor() {
    this._lootBag = {};
    this._timeout = null;
  }

  set timeoutInSeconds(timeInSeconds: number | null) {
    this._timeout = timeInSeconds;
  }

  get timeoutInSeconds(): null | number {
    return this._timeout;
  }

  put(key: string, val: any, keyTimeout = null): void {
    const item = { v: val, t: this._getNow(), kt: keyTimeout};
    this._lootBag[key] = item;
  }

  get(key: string, defaultValue = null): any {
    if (key in this._lootBag) {
      if (this._timeout === null && this._lootBag.kt === null) {
        return this._lootBag[key].v;
      } else {
        if (this._isCacheStale(this._lootBag[key])) {
          this.removeKey(key);
          return defaultValue;
        } else {
          return this._lootBag[key].v;
        }
      }
    } else {
      return defaultValue;
    }
  }

  removeKey(key: string): void {
    if (key in this._lootBag) {
      delete this._lootBag[key];
    }
  }

  keyExists(key: string): boolean {
    if (key in this._lootBag) {
      if (this._timeout === null && this._lootBag.kt === null) {
        return true;
      } else {
        if (this._isCacheStale(this._lootBag[key])) {
          this.removeKey(key);
          return false;
        } else {
          return true;
        }
      }
    } else {
      return false;
    }
  }

  _getNow(): number {
    return Math.floor(Date.now() / 1000);
  }

  // This method is called only when at least one of the timeouts has been set.
  // key timeout has priority. general this._timeout is used only if key
  // timeout hasn't been set.
  _isCacheStale(obj: LootBagItem): boolean {
    const timestamp = obj.t;
    const timeout = obj.kt === null ? this._timeout as number : obj.kt;
    return (this._getNow() - timestamp) > timeout;
  }
}

const ttlStorage = new TTLStorage();
export { ttlStorage };
