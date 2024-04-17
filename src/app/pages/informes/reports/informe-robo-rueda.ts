import {
  Content,
  ContentStack,
  TDocumentDefinitions,
} from 'pdfmake/interfaces';
import { Images } from '../../../interfaces/images.interface';
import pdfMake from 'pdfmake/build/pdfmake';
import { firstPage } from './first-page';
import { imagesPage } from './images';
import { FirstPage, LastPage } from '../../../interfaces/pdf.interface';
import { lastPage } from './last-page';

export const viewPdfRuedas = async (
  firstPageI: FirstPage,
  lastPageI: LastPage,
  documentsList: Images[],
  carList: Images[],
  otherList: Images[],
  rdiList: Images[],
  rddList: Images[],
  rtiList: Images[],
  rtdList: Images[],
  rdaList: Images[]
) => {
  const first = await firstPage(firstPageI);
  const documents = await imagesPage(documentsList, false);
  const car = await imagesPage(carList, false);
  const rdi = await imagesRuedas(rdiList);
  const rdd = await imagesRuedas(rddList);
  const rti = await imagesRuedas(rtiList);
  const rtd = await imagesRuedas(rtdList);
  const rda = await imagesRuedas(rdaList);
  const otros = await imagesPage(otherList, false, true);
  const last_page = await lastPage(lastPageI);
  const pM = pdfMake;
  pM.fonts = {
    // download default Roboto font from cdnjs.com
    Roboto: {
      normal:
        'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf',
      bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf',
      italics:
        'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf',
      bolditalics:
        'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf',
    },
  };
  const dd: TDocumentDefinitions = {
    content: [
      ...first,
      ...documents,
      ...car,
      ...rdi,
      ...rdd,
      ...rti,
      ...rtd,
      ...rda,
      ...otros,
      ...last_page,
    ],
    //! Footer del PDF ---------------------------------------------------------->
    footer: function (currentPage, pageCount) {
      return {
        text: currentPage.toString() + ' de ' + pageCount,
        alignment: 'center',
      };
    },
    //! Esto es el margin de la página, y el canvas de la línea que lo redea
    //pageMargins: [20, 70, 20, 35], // [left, top, right, bottom]
    pageMargins: [20, 50, 20, 35], // [left, top, right, bottom]
    background: function (currentPage) {
      return {
        canvas: [
          {
            type: 'rect',
            x: 20,
            y: 20,
            w: 557, // A4 width in PDF units
            h: 802, // A4 height in PDF units
            lineWidth: 1,
            lineColor: '#000',
          },
        ],
      };
    },
  };
  pdfMake.createPdf(dd, undefined, pdfMake.fonts).open();
};

const imagesRuedas = async (images: Images[]) => {
  const content: Content = [];
  if (images.length > 0) {
    if (images.length === 1) {
      const stack: ContentStack = {
        stack: [
          {
            text: images[0]?.comment,
            alignment: 'center',
            margin: [0, 0, 0, 10],
            fontSize: 14,
            pageBreak: 'before',
          },
          {
            image: images[0]!.img,
            fit: [495, 742],
            alignment: 'center',
            margin: [0, 0, 0, 15],
          },
        ],
      };
      content.push(stack);
    } else if (images.length === 2) {
      const stack: ContentStack = {
        stack: [
          {
            text: images[0]?.comment,
            alignment: 'center',
            margin: [0, 0, 0, 10],
            fontSize: 14,
            pageBreak: 'before',
          },
          {
            image: images[0]!.img,
            fit: [480, 330],
            alignment: 'center',
            margin: [0, 0, 0, 15],
          },
          {
            text: images[1]?.comment,
            alignment: 'center',
            margin: [0, 0, 0, 10],
            fontSize: 14,
            pageBreak: 'before',
          },
          {
            image: images[1]!.img,
            fit: [480, 330],
            alignment: 'center',
            margin: [0, 0, 0, 15],
          },
        ],
      };
      content.push(stack);
    } else if (images.length === 3) {
      const a = images[0];
      const b = images[1];
      const c = images[2];
      const stack: ContentStack = {
        stack: [
          a
            ? {
                text: a?.comment,
                alignment: 'center',
                margin: [0, 0, 0, 10],
                fontSize: 14,
                pageBreak: 'before',
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
                text: b?.comment,
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
              }
            : '',
          c
            ? {
                text: c?.comment,
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
              }
            : '',
        ],
      };
      content.push(stack);
    }
    return content;
  } else {
    return content;
  }
};
