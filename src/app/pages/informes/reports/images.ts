import { Content, ContentStack } from 'pdfmake/interfaces';
import { Images } from '../../../interfaces/images.interface';
import { compareDimensions, getImageHeight } from '../../../tools/image-height';

export const imagesPage = async (
  images: Images[],
  isRoboRueda: boolean,
  pageBreak?: boolean
) => {
  const content: Content = [];
  if (images.length > 0) {
    // Creamos la variable
    pageBreak
      ? content.push({
          stack: [
            {
              text: '',
              pageBreak: 'before',
            },
          ],
        })
      : '';
    // Esta variable sirve para los saltos de página
    let i = 0;
    let ruedas = ['rdi', 'rdd', 'rti', 'rtd'];
    for (const [index, image] of images.entries()) {
      /**
       * Comparamos las dimensiones, si el alto es mayor que el ancho (con un 10% +),
       * significa que la imagen entra en una hoja solamente, caso contrario, serían 2
       */
      if (isRoboRueda) {
        if (!image.dot) {
          const compare = await compareDimensions(image.img);
          if (compare) {
            i = 0;
            /**
             * Ahora comparamos que no sea mayor que el alto de la hora
             *   ! fit: [495, 742],
             *   !El restante de una hoja A4, con los margin, es de 736 de alto, y 368 de ancho aprox,
             */
            const imgHeight: number = await getImageHeight(image.img);
            if (imgHeight > 710) {
              //* En esta sección, no manejamos el ancho, sino el alto
              const stack: ContentStack = {
                stack: [
                  {
                    text: image.comment,
                    alignment: 'center',
                    margin: [0, 0, 0, 10],
                    fontSize: 14,
                  }, // [left, top, right, bottom]
                  {
                    image: image.img,
                    fit: [550, 800],
                    //height: 600,
                    alignment: 'center',
                    margin: [0, 0, 0, 15],
                    pageBreak:
                      index !== images.length - 1 ? 'after' : undefined,
                  },
                ],
              };
              content.push(stack);
            } else {
              /**
               * En caso que no sea mayor que el ancho de la hoja, lo manejamos por el ancho
               */
              const stack: ContentStack = {
                stack: [
                  {
                    text: image.comment,
                    alignment: 'center',
                    margin: [0, 0, 0, 10],
                    fontSize: 14,
                  }, // [left, top, right, bottom]
                  {
                    image: image.img,
                    fit: [550, 800],
                    alignment: 'center',
                    margin: [0, 0, 0, 15],
                    pageBreak:
                      index !== images.length - 1 ? 'after' : undefined,
                  },
                ],
              };
              content.push(stack);
            }
          } else {
            /**
             * Si no supera el ancho, significa que se pueden colocar 2 por hoja
             */
            //* Si el contador entra en 2, agregamos un salto de página
            //! TENER EN CUENTA QUE SI LA IMAGEN ES LA ÚLTIMA, NO DEBE SALTAR LA PÁG.
            i++;
            const stack: ContentStack = {
              stack: [
                {
                  text: image.comment,
                  alignment: 'center',
                  margin: [0, 0, 0, 10],
                  fontSize: 14,
                }, // [left, top, right, bottom]
                {
                  image: image.img,
                  //width: 368, //width: 280,
                  //fit: [380, 300],
                  fit: [480, 330],
                  alignment: 'center',
                  margin: [0, 0, 0, 15],
                  pageBreak:
                    index !== images.length - 1
                      ? i === 2
                        ? 'after'
                        : undefined
                      : undefined,
                },
              ],
            };
            content.push(stack);
            if (i === 2) i = 0;
          }
        } else if (ruedas.includes(image.dot.code)) {
          ruedas = ruedas.filter((r) => r !== image.dot?.code);
          const a = images.find((i) => i.dot?.code === image.dot?.code);
          const b = images.find((i) => i.dot?.code === image.dot?.code + 'd');
          const c = images.find((i) => i.dot?.code === image.dot?.code + 'dot');
          const stack: ContentStack = {
            stack: [
              a
                ? {
                    text: a?.dot?.name!,
                    alignment: 'center',
                    margin: [0, 0, 0, 10],
                    fontSize: 14,
                    pageBreak: i === 1 ? 'before' : undefined,
                  }
                : '',
              a
                ? {
                    image: a!.img,
                    fit: [320, 220],
                    alignment: 'center',
                    margin: [0, 0, 0, 15],
                  }
                : '',
              b
                ? {
                    text: b?.dot?.name!,
                    alignment: 'center',
                    margin: [0, 0, 0, 10],
                    fontSize: 14,
                  }
                : '',
              b
                ? {
                    image: b!.img,
                    fit: [320, 220],
                    alignment: 'center',
                    margin: [0, 0, 0, 15],
                    pageBreak:
                      index !== images.length - 1
                        ? i === 2
                          ? 'after'
                          : undefined
                        : undefined,
                  }
                : '',
              c
                ? {
                    text: c?.dot?.name!,
                    alignment: 'center',
                    margin: [0, 0, 0, 10],
                    fontSize: 14,
                  }
                : '',
              c
                ? {
                    image: c!.img,
                    fit: [300, 200],
                    alignment: 'center',
                    margin: [0, 0, 0, 15],
                    pageBreak: 'after',
                  }
                : '',
            ],
          };
          content.push(stack);
          i = 0;
        }
      } else {
        const compare = await compareDimensions(image.img);
        if (compare) {
          /**
           * Ahora comparamos que no sea mayor que el alto de la hora
           *   ! fit: [495, 742],
           *   !El restante de una hoja A4, con los margin, es de 736 de alto, y 368 de ancho aprox,
           */
          const imgHeight: number = await getImageHeight(image.img);
          if (imgHeight > 710) {
            //* En esta sección, no manejamos el ancho, sino el alto
            const stack: ContentStack = {
              stack: [
                {
                  text: image.comment,
                  alignment: 'center',
                  margin: [0, 0, 0, 10],
                  fontSize: 14,
                  pageBreak: i === 1 ? 'before' : undefined,
                }, // [left, top, right, bottom]
                {
                  image: image.img,
                  fit: [480, 690],
                  alignment: 'center',
                  margin: [0, 0, 0, 15],
                  pageBreak: index !== images.length - 1 ? 'after' : undefined,
                },
              ],
            };
            content.push(stack);
          } else {
            /**
             * En caso que no sea mayor que el ancho de la hoja, lo manejamos por el ancho
             */
            const stack: ContentStack = {
              stack: [
                {
                  text: image.comment,
                  alignment: 'center',
                  margin: [0, 0, 0, 10],
                  fontSize: 14,
                  pageBreak: i === 1 ? 'before' : undefined,
                }, // [left, top, right, bottom]
                {
                  image: image.img,
                  fit: [500, 720],
                  alignment: 'center',
                  margin: [0, 0, 0, 15],
                  pageBreak: index !== images.length - 1 ? 'after' : undefined,
                },
              ],
            };
            content.push(stack);
          }
          i = 0;
        } else {
          /**
           * Si no supera el ancho, significa que se pueden colocar 2 por hoja
           */
          //* Si el contador entra en 2, agregamos un salto de página
          //! TENER EN CUENTA QUE SI LA IMAGEN ES LA ÚLTIMA, NO DEBE SALTAR LA PÁG.
          i++;
          const stack: ContentStack = {
            stack: [
              {
                text: image.comment,
                alignment: 'center',
                margin: [0, 0, 0, 10],
                fontSize: 14,
              }, // [left, top, right, bottom]
              {
                image: image.img,
                fit: [480, 330],
                alignment: 'center',
                margin: [0, 0, 0, 15],
                pageBreak:
                  index !== images.length - 1
                    ? i === 2
                      ? 'after'
                      : undefined
                    : undefined,
              },
            ],
          };
          content.push(stack);
          if (i === 2) i = 0;
        }
      }
    }
  }
  return content;
};
