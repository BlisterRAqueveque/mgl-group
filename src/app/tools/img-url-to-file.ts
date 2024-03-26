export const dataURLtoFile = (
  dataUrl: string,
  filename: string,
  mimeType: string
) => {
  switch (mimeType) {
    case 'image/jpeg': {
      filename = 'img.jpeg';
      break;
    }
    case 'application/pdf': {
      filename = 'pdf.pdf';
      break;
    }
    default: {
    }
  }
  if (!dataUrl || !filename || !mimeType) {
    throw new Error('Los datos de entrada son incorrectos.');
  }
  const arr = dataUrl.split(',');
  const bstr = atob(arr[1]);
  const n = bstr.length;
  const u8arr = new Uint8Array(n);

  for (let i = 0; i < n; i++) {
    u8arr[i] = bstr.charCodeAt(i);
  }

  return new File([u8arr], filename, { type: mimeType });
};
