/** @description Obtenemos el height de la imagen */
export const getImageHeight = (base64: string) => {
  return new Promise<number>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      //* Le aplicamos el width que tendría al final
      img.width = 450;
      //* Calculamos el aspectRatio, para obtener el height
      const aspectRatio = img.naturalWidth / img.naturalHeight;
      const height = 450 / aspectRatio;
      //* Devolvemos el height
      resolve(height);
    };
    img.onerror = function () {
      reject(0);
    };
    img.src = base64;
  });
};

export const compareDimensions = (base64: string) => {
  return new Promise<boolean>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const width = (img.naturalWidth * 20) / 100 + img.naturalWidth;
      const compare = width < img.naturalHeight;
      resolve(compare);
    };
    img.onerror = () => {
      reject(null);
    };
    img.src = base64;
  });
};
