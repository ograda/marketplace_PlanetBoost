// src/utils/imagePath.ts
export const getProductImagePath = (image: string): string => {
    // This assumes your images are stored in public/images
    // and that you always want to append ".jpg"
    return `/images/${image}.jpg`;
  };