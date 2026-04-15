export const uploadImages = async (files: string[]): Promise<string[]> => {
  if (files.length === 0) {
    return [];
  }

  return files
    .filter((file) => file.trim().length > 0)
    .map((file, index) => {
      // In this MVP we keep browser-provided data URLs or public URLs as-is
      // so uploaded issue images render immediately in cards and detail views.
      if (file.startsWith("data:image/") || file.startsWith("http://") || file.startsWith("https://")) {
        return file;
      }

    const token = `${Date.now()}-${index + 1}`;
    return `https://res.cloudinary.com/mock-smart-city/image/upload/${token}.jpg`;
    });
};
