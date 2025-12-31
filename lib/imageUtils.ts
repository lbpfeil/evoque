/**
 * Redimensiona uma imagem para caber em maxWidth × maxHeight mantendo aspect ratio.
 * Saída: JPEG blob com qualidade especificada.
 *
 * @param file - O arquivo de imagem original
 * @param maxWidth - Largura máxima em pixels
 * @param maxHeight - Altura máxima em pixels
 * @param quality - Qualidade JPEG (0-1), padrão 0.85
 * @returns Promise<Blob> - Imagem redimensionada como JPEG blob
 */
export const resizeImage = async (
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality: number = 0.85
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = (e) => {
      if (!e.target?.result) {
        reject(new Error('No file data'));
        return;
      }
      img.src = e.target.result as string;
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.onload = () => {
      try {
        // Calcular dimensões mantendo aspect ratio
        let width = img.width;
        let height = img.height;

        // Reduzir tamanho se necessário
        if (width > maxWidth || height > maxHeight) {
          const widthRatio = maxWidth / width;
          const heightRatio = maxHeight / height;
          const ratio = Math.min(widthRatio, heightRatio);

          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        // Criar canvas e desenhar imagem redimensionada
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Desenhar imagem com configurações de alta qualidade
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Converter para blob JPEG
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          'image/jpeg',
          quality
        );
      } catch (error) {
        reject(error);
      }
    };

    reader.readAsDataURL(file);
  });
};
