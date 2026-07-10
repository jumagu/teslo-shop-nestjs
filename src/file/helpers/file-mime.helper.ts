const mimeTypes: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
};

/**
 * Resolves the MIME type from a file name based on its extension.
 * Falls back to `application/octet-stream` for unknown extensions.
 */
export const getFileMimeType = (fileName: string): string => {
  const extension = fileName.split('.').at(-1)?.toLowerCase() ?? '';

  return mimeTypes[extension] ?? 'application/octet-stream';
};