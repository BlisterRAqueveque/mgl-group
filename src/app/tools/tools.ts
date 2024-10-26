import { throwError } from 'rxjs';

/** @description FX para el manejo de errores de las peticiones */
export const handleError = (error: any) => {
  console.error(error);
  return throwError(() => error);
};

export const urlToBase64 = async (url: string): Promise<string> => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('La conversión de la URL a base64 ha fallado.'));
      }
    };
    reader.readAsDataURL(blob);
  });
};
