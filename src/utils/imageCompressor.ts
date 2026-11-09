/**
 * Utility to compress and resize image files selected from gallery or camera
 * Keeps image file size compact (typically 80KB ~ 180KB) to ensure:
 * 1. Rapid UI rendering and zero memory pressure
 * 2. Safe storage in localStorage without QuotaExceededError
 * 3. Safe document storage in Firestore (under the 1MB limit)
 */
export async function compressImageFile(
  file: File,
  maxWidth = 1080,
  maxHeight = 1080,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve) => {
    // If not an image, return empty string
    if (!file || !file.type.startsWith('image/')) {
      resolve('');
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) {
        resolve('');
        return;
      }

      const img = new Image();

      img.onload = () => {
        try {
          let { width, height } = img;

          // Downscale if larger than max dimensions while preserving aspect ratio
          if (width > maxWidth || height > maxHeight) {
            const widthRatio = maxWidth / width;
            const heightRatio = maxHeight / height;
            const ratio = Math.min(widthRatio, heightRatio);

            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            // Fallback to data URL
            resolve(dataUrl);
            return;
          }

          // Use high quality image smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          ctx.drawImage(img, 0, 0, width, height);

          // Compress to JPEG with designated quality
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } catch (err) {
          console.warn('Canvas compression failed, falling back to original:', err);
          resolve(dataUrl);
        }
      };

      img.onerror = (err) => {
        console.warn('Image loading failed in compressor, fallback:', err);
        resolve(dataUrl);
      };

      img.src = dataUrl;
    };

    reader.onerror = (err) => {
      console.error('FileReader error in compressImageFile:', err);
      resolve('');
    };

    reader.readAsDataURL(file);
  });
}
