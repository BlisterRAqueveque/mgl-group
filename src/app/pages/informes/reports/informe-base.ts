import pdfMake from 'pdfmake/build/pdfmake';
import { Images } from '../../../interfaces/images.interface';
import { FirstPage, LastPage } from '../../../interfaces/pdf.interface';
import { firstPage } from './first-page';
import { imagesPage } from './images';
import { lastPage } from './last-page';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

export const viewPdfBase = async (
  firstPageI: FirstPage,
  lastPageI: LastPage,
  documentsList: Images[],
  carList: Images[],
  otherList: Images[]
) => {
  const first = await firstPage(firstPageI);
  const documents = await imagesPage(documentsList, false);
  const car = await imagesPage(carList, false);
  const others = await imagesPage(otherList, false, true);
  const last = await lastPage(lastPageI);
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
    content: [...first, ...documents, ...car, ...others, ...last],
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
