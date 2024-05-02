/** @description Desde una url podemos convertir la imagen a base64 y comprimirla */
export const imgToBase64 = (
  url: string,
  quality: number = 0.7
): Promise<string | null> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('Error on canvas context.');
        resolve(null);
        return;
      }
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Convertir la imagen a base64 con compresión
      const dataUrl = canvas.toDataURL('image/jpeg', quality); // Utilizando JPEG con calidad ajustable

      resolve(dataUrl);
    };
    img.onerror = (error) => {
      console.error('Error on upload image: ', error);
      resolve(null);
    };
    img.src = url;
  });
};

/** @description Desde una url podemos convertir la imagen a base64 */
export const imgToBase64Original = (url: string): Promise<string | null> => {
  return new Promise((resolve, rejected) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        resolve(dataUrl);
      } else {
        console.error('Error on canvas context.');
        resolve(null);
      }
    };
    img.onerror = (error) => {
      console.error('Error on upload image: ', error);
      //! Se debería mandar el rejected, pero en este contexto necesito enviar el null
      //rejected(null)
      resolve(null);
    };
    img.src = url;
  });
};
