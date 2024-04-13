import { Content } from 'pdfmake/interfaces';
import { environment } from '../../../../environments/environment';
import { urlToBase64 } from '../../../tools/tools';
import { LastPage } from '../../../interfaces/pdf.interface';

export const lastPage = async (lastPageI: LastPage) => {
  const content: Content = [
    {
      stack: [
        {
          text: 'Según el relevamiento realizado podemos decir:',
          alignment: 'left',
          fontSize: 14,
          margin: [14, 0, 14, 10],
          pageBreak: 'before',
        },
      ],
    },
    {
      stack: [
        {
          text: lastPageI.relevamiento
            ? lastPageI.relevamiento
            : 'No se ha cargado un relevamiento.',
          alignment: 'left',
          fontSize: 13,
          margin: [14, 0, 14, 14],
        },
      ],
    },
    {
      stack: [
        {
          text: 'Conclusión',
          alignment: 'left',
          fontSize: 14,
          margin: [14, 0, 14, 10],
        },
        {
          stack: [
            {
              text: lastPageI.conclusion
                ? lastPageI.conclusion
                : 'No se ha cargado una conclusión',
              alignment: 'left',
              fontSize: 13,
              margin: [14, 0, 14, 14],
            },
          ],
        },
      ],
    },
    !lastPageI.abierta
      ? {
          stack: [
            {
              image: await urlToBase64(
                environment.webUrl + 'assets/img/signature.jpg'
              ),
              fit: [150, 150],
              alignment: 'right',
              margin: [0, 0, 0, 6],
            },
            {
              text: 'Martin Gabriel Larracharte',
              alignment: 'right',
              fontSize: 13,
              margin: [14, 0, 14, 6],
              bold: true,
            },
            {
              text: 'Tec. en pericias de Siniestros Viales',
              alignment: 'right',
              fontSize: 13,
              margin: [14, 0, 14, 6],
            },
            {
              text: 'Mat: 4542',
              alignment: 'right',
              fontSize: 13,
              margin: [14, 0, 14, 6],
            },
          ],
        }
      : '',
  ];
  return content;
};
