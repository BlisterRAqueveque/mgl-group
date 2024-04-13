import pdfMake from 'pdfmake/build/pdfmake';
import { Images } from '../../../interfaces/images.interface';
import { ContentStack, TDocumentDefinitions } from 'pdfmake/interfaces';
import { imagesPage } from './images';
import { firstPage } from './first-page';
import { lastPage } from './last-page';
import { FirstPage, LastPage } from '../../../interfaces/pdf.interface';
import { TercerosInformeComponent } from '../components/terceros/terceros.component';

export const viewPdfTerceros = async (
  firstPageI: FirstPage,
  lastPageI: LastPage,
  tercerosComponents: TercerosInformeComponent[],
  documentsList: Images[],
  carList: Images[],
  damagesList: Images[],
  otherList: Images[]
) => {
  const first = await firstPage(firstPageI);
  const documents = await imagesPage(documentsList, false);
  const documentsTerceros = await imagesPage(carList, false, true);
  const terceros = await tercerosPdf(tercerosComponents);
  const danios = await imagesPage(damagesList, false, true);
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
      ...documentsTerceros,
      ...terceros,
      ...danios,
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

export const tercerosPdf = async (
  tercerosComponents: TercerosInformeComponent[]
) => {
  const stack: ContentStack[] = [];
  for (const t of tercerosComponents) {
    stack.push({
      stack: [
        {
          text: 'Datos de tercero',
          alignment: 'center',
          fontSize: 16,
          margin: [14, 14, 0, 8],
          pageBreak: 'before',
        },
        {
          text: `Nombre: ${t.nombre}`,
          alignment: 'left',
          fontSize: 14,
          margin: [14, 0, 0, 8],
        },
        {
          text: `Domicilio: ${t.domicilio}`,
          alignment: 'left',
          fontSize: 14,
          margin: [14, 0, 0, 8],
        },
        {
          text: `Teléfono: ${t.tel}`,
          alignment: 'left',
          fontSize: 14,
          margin: [14, 0, 0, 8],
        },
        {
          text: `Vehículo: ${t.veh}`,
          alignment: 'left',
          fontSize: 14,
          margin: [14, 0, 0, 8],
        },
        {
          text: `Patente: ${t.patente}`,
          alignment: 'left',
          fontSize: 14,
          margin: [14, 0, 0, 8],
        },
        {
          stack: [
            {
              text: 'Ampliación de denuncia',
              alignment: 'center',
              fontSize: 16,
              margin: [0, 0, 0, 10],
            },
          ],
        },
        {
          stack: [
            {
              text: t.amp_denuncia
                ? t.amp_denuncia
                : 'No se cargó una ampliación de denuncia',
              alignment: 'left',
              fontSize: 13,
              margin: [14, 0, 0, 10],
              pageBreak: 'after',
            },
          ],
        },
        await imagesPage(t.documents, false),
        await imagesPage(t.car, false),
      ],
    });
  }
  return stack;
};
