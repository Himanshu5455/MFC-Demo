
const idToFile = new Map();

const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export const cacheFiles = (files) => {
  if (!Array.isArray(files)) return [];
  return files.map((file) => {
    const id = generateId();
    idToFile.set(id, file);
    return {
      id,
      name: file?.name ?? "file",
      size: file?.size ?? 0,
      type: file?.type ?? "application/octet-stream",
      lastModified: file?.lastModified ?? undefined,
    };
  });
};

export const getFilesFromMeta = (metas) => {
  if (!Array.isArray(metas)) return [];
  return metas
    .map((m) => idToFile.get(m?.id))
    .filter((f) => f instanceof File || f instanceof Blob);
};

export const clearFileCache = () => {
  idToFile.clear();
};

