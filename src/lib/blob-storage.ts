export function isBlobEnabled(): boolean {
  return !!(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

export function blobAuth() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (token) return { token };

  const storeId = process.env.BLOB_STORE_ID;
  if (storeId) return { storeId };

  return {};
}

export function blobPathname(folder: string, filename: string): string {
  const cleanFolder = folder.replace(/^\/+/, "").replace(/\/+$/, "");
  return `mauricio/${cleanFolder}/${filename}`;
}
