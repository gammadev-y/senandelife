import imageCompression from 'browser-image-compression';

export const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const compressFileBeforeUpload = async (file: File, maxSizeMB: number = 1): Promise<File> => {
  if (file.size <= maxSizeMB * 1024 * 1024) {
    return file; // No compression needed
  }

  const options = {
    maxSizeMB: maxSizeMB,
    maxWidthOrHeight: 1920, // Common max dimension
    useWebWorker: true,
    // more options here if needed, e.g., initialQuality
  };

  try {
    console.log(`Original image size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
    const compressedFile = await imageCompression(file, options);
    console.log(`Compressed image size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);

    if (compressedFile.size > maxSizeMB * 1024 * 1024) {
      throw new Error(`Image is still too large after compression (>${maxSizeMB}MB). Please use a smaller image.`);
    }
    return compressedFile;
  } catch (error) {
    console.error('Image compression error:', error);
    if (error instanceof Error && error.message.includes("too large after compression")) {
        throw error;
    }
    // For other compression errors, we might decide to return the original file or throw a generic error.
    // For now, let's re-throw a more specific error if it's not the "too large" one.
    throw new Error('Image compression failed. Please try a different image or check console for details.');
  }
};
