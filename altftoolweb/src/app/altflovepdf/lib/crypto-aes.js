/**
 * AES-256 and Web Crypto API helper functions for PDF encryption/decryption.
 */

export function concat(...arrays) {
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

export async function sha256(data) {
  const hash = await crypto.subtle.digest("SHA-256", data);
  return new Uint8Array(hash);
}

export async function sha384(data) {
  const hash = await crypto.subtle.digest("SHA-384", data);
  return new Uint8Array(hash);
}

export async function sha512(data) {
  const hash = await crypto.subtle.digest("SHA-512", data);
  return new Uint8Array(hash);
}

export async function aes128CbcEncrypt(data, key, iv) {
  const cryptoKey = await crypto.subtle.importKey("raw", key, "AES-CBC", false, ["encrypt"]);
  const encrypted = await crypto.subtle.encrypt({ name: "AES-CBC", iv }, cryptoKey, data);
  return new Uint8Array(encrypted).slice(0, data.byteLength);
}

export async function aes256CbcEncrypt(data, key, iv) {
  const cryptoKey = await crypto.subtle.importKey("raw", key, "AES-CBC", false, ["encrypt"]);
  const encrypted = await crypto.subtle.encrypt({ name: "AES-CBC", iv }, cryptoKey, data);
  return new Uint8Array(encrypted);
}

export async function aes256CbcEncryptNoPad(data, key, iv) {
  const cryptoKey = await crypto.subtle.importKey("raw", key, "AES-CBC", false, ["encrypt"]);
  const encrypted = await crypto.subtle.encrypt({ name: "AES-CBC", iv }, cryptoKey, data);
  return new Uint8Array(encrypted).slice(0, data.byteLength);
}

export async function aes256EcbEncryptBlock(block, key) {
  const iv = new Uint8Array(16);
  const cryptoKey = await crypto.subtle.importKey("raw", key, "AES-CBC", false, ["encrypt"]);
  const encrypted = await crypto.subtle.encrypt({ name: "AES-CBC", iv }, cryptoKey, block);
  return new Uint8Array(encrypted).slice(0, 16);
}

export async function importAES256Key(key) {
  return await crypto.subtle.importKey("raw", key, "AES-CBC", false, ["encrypt"]);
}

export async function aes256CbcEncryptWithKey(data, cryptoKey, iv) {
  const encrypted = await crypto.subtle.encrypt({ name: "AES-CBC", iv }, cryptoKey, data);
  return new Uint8Array(encrypted);
}

export async function aes256CbcDecrypt(data, key, iv) {
  const cryptoKey = await crypto.subtle.importKey("raw", key, "AES-CBC", false, ["decrypt"]);
  const decrypted = await crypto.subtle.decrypt({ name: "AES-CBC", iv }, cryptoKey, data);
  return new Uint8Array(decrypted);
}

export async function aes256CbcDecryptNoPad(ciphertext, key, iv) {
  const cryptoKey = await crypto.subtle.importKey("raw", key, "AES-CBC", false, ["encrypt", "decrypt"]);
  const lastBlock = ciphertext.slice(ciphertext.length - 16);
  const xored = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    xored[i] = lastBlock[i] ^ 0x10;
  }
  const zeroIV = new Uint8Array(16);
  const encResult = await crypto.subtle.encrypt({ name: "AES-CBC", iv: zeroIV }, cryptoKey, xored);
  const cFake = new Uint8Array(encResult).slice(0, 16);
  const extended = concat(ciphertext, cFake);
  const decrypted = await crypto.subtle.decrypt({ name: "AES-CBC", iv }, cryptoKey, extended);
  return new Uint8Array(decrypted).slice(0, ciphertext.length);
}

export async function aes256EcbDecryptBlock(block, key) {
  const zeroIV = new Uint8Array(16);
  return aes256CbcDecryptNoPad(block, key, zeroIV);
}

export async function importAES256DecryptKey(key) {
  return await crypto.subtle.importKey("raw", key, "AES-CBC", false, ["encrypt", "decrypt"]);
}

export async function aes256CbcDecryptWithKey(data, cryptoKey, iv) {
  const decrypted = await crypto.subtle.decrypt({ name: "AES-CBC", iv }, cryptoKey, data);
  return new Uint8Array(decrypted);
}

export async function computeHash2B(password, salt, userKey) {
  const input = concat(password, salt, userKey);
  let K = await sha256(input);
  let i = 0;
  let E;
  while (true) {
    const block = concat(password, K, userKey);
    const K1 = new Uint8Array(block.length * 64);
    for (let j = 0; j < 64; j++) {
      K1.set(block, j * block.length);
    }
    const aesKey = K.slice(0, 16);
    const aesIV = K.slice(16, 32);
    E = await aes128CbcEncrypt(K1, aesKey, aesIV);
    let byteSum = 0;
    for (let j = 0; j < 16; j++) {
      byteSum += E[j];
    }
    const hashSelect = byteSum % 3;
    if (hashSelect === 0) {
      K = await sha256(E);
    } else if (hashSelect === 1) {
      K = await sha384(E);
    } else {
      K = await sha512(E);
    }
    i++;
    if (i >= 64 && E[E.length - 1] <= i - 32) {
      break;
    }
  }
  return K.slice(0, 32);
}
