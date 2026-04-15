export const uploadImages = async (files: string[]): Promise<string[]> => {
  if (files.length === 0) {
    return [];
  }

  return files.map((_, index) => {
    const token = `${Date.now()}-${index + 1}`;
    return `https://res.cloudinary.com/mock-smart-city/image/upload/${token}.jpg`;
  });
};
