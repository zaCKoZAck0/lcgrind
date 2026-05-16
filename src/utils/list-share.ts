export interface SharePayload {
  id: string;
  name: string;
  problemIds: number[];
}

function toBase64url(bytes: Uint8Array): string {
  return btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join(''))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function fromBase64url(str: string): Uint8Array {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = (4 - (padded.length % 4)) % 4;
  const raw = atob(padded + '='.repeat(pad));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

function writeVarint(buf: number[], value: number): void {
  do {
    let byte = value & 0x7f;
    value >>>= 7;
    if (value !== 0) byte |= 0x80;
    buf.push(byte);
  } while (value !== 0);
}

function readVarint(
  bytes: Uint8Array,
  offset: number
): { value: number; nextOffset: number } {
  let value = 0;
  let shift = 0;
  while (true) {
    if (offset >= bytes.length) throw new Error('Unexpected end of input');
    const byte = bytes[offset++];
    value |= (byte & 0x7f) << shift;
    shift += 7;
    if ((byte & 0x80) === 0) break;
  }
  return { value, nextOffset: offset };
}

const VERSION = 1;
const LIST_ID_LEN = 10;

export function encodeSharePayload({ id, name, problemIds }: SharePayload): string {
  const nameBytes = new TextEncoder().encode(name);
  const buf: number[] = [];

  buf.push(VERSION);

  // listId: exactly 10 ASCII chars
  for (let i = 0; i < LIST_ID_LEN; i++) {
    buf.push(id.charCodeAt(i) & 0xff);
  }

  // name length + bytes
  writeVarint(buf, nameBytes.length);
  nameBytes.forEach((b) => buf.push(b));

  // problem count + ids
  writeVarint(buf, problemIds.length);
  for (const pid of problemIds) {
    writeVarint(buf, pid);
  }

  return toBase64url(new Uint8Array(buf));
}

export function decodeSharePayload(token: string): SharePayload | null {
  try {
    const bytes = fromBase64url(token);
    let offset = 0;

    if (bytes[offset++] !== VERSION) return null;

    if (offset + LIST_ID_LEN > bytes.length) return null;
    const id = String.fromCharCode(...Array.from(bytes.slice(offset, offset + LIST_ID_LEN)));
    offset += LIST_ID_LEN;

    const { value: nameLen, nextOffset: o1 } = readVarint(bytes, offset);
    offset = o1;

    if (offset + nameLen > bytes.length) return null;
    const name = new TextDecoder().decode(bytes.slice(offset, offset + nameLen));
    offset += nameLen;

    const { value: count, nextOffset: o2 } = readVarint(bytes, offset);
    offset = o2;

    const problemIds: number[] = [];
    for (let i = 0; i < count; i++) {
      const { value, nextOffset: o3 } = readVarint(bytes, offset);
      offset = o3;
      problemIds.push(value);
    }

    return { id, name, problemIds };
  } catch {
    return null;
  }
}
