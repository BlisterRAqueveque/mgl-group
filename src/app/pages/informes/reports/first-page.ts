import { Content } from 'pdfmake/interfaces';
import { environment } from '../../../../environments/environment';
import { imgToBase64, imgToBase64Original } from '../../../tools/img-to-url';
import { FirstPage } from '../../../interfaces/pdf.interface';

export const firstPage = async (firstPageI: FirstPage) => {
  const img = await imgToBase64Original(`${environment.webUrl}assets/logo.png`);
  const content: Content = [
    {
      stack: [
        {
          image: img!,
          width: 300,
          alignment: 'center',
          margin: [0, 20, 0, 50], // [left, top, right, bottom]
        },
      ],
    },
    {
      stack: [
        {
          text: 'Informe de investigación',
          decoration: 'underline',
          alignment: 'center',
          fontSize: 22,
          margin: [0, 0, 0, 12],
        },
      ],
    },
    {
      stack: [
        {
          text: firstPageI.tipo_siniestro,
          alignment: 'center',
          fontSize: 20,
          margin: [0, 0, 0, 14],
        },
      ],
    },
    {
      stack: [
        {
          text: firstPageI.hecho,
          alignment: 'center',
          fontSize: 16,
          margin: [0, 0, 0, 14],
        },
      ],
    },
    {
      stack: [
        {
          text: `N° de siniestro: ${
            firstPageI.n_siniestro ? firstPageI.n_siniestro : 'No tiene'
          }`,
          alignment: 'left',
          fontSize: 16,
          margin: [14, 0, 0, 8],
        },
      ],
    },
    {
      stack: [
        {
          text: `N° de denuncia: ${
            firstPageI.n_denuncia ? firstPageI.n_denuncia : 'No tiene'
          }`,
          alignment: 'left',
          fontSize: 16,
          margin: [14, 0, 0, 8],
        },
      ],
    },
    {
      stack: [
        {
          text: 'Datos del asegurado',
          alignment: 'center',
          fontSize: 20,
          margin: [0, 14],
        },
      ],
    },
    {
      stack: [
        {
          text: `Asegurado: ${
            firstPageI.nombre_asegurado
              ? firstPageI.nombre_asegurado
              : 'No se proveyó'
          }`,
          alignment: 'left',
          fontSize: 16,
          margin: [14, 0, 0, 8],
        },
      ],
    },
    {
      stack: [
        {
          text: `Domicilio: ${
            firstPageI.dir_asegurado
              ? firstPageI.dir_asegurado
              : 'No se proveyó'
          }`,
          alignment: 'left',
          fontSize: 16,
          margin: [14, 0, 0, 8],
        },
      ],
    },
    {
      stack: [
        {
          text: `Teléfono: ${
            firstPageI.tel_asegurado
              ? firstPageI.tel_asegurado
              : 'No se proveyó'
          }`,
          alignment: 'left',
          fontSize: 16,
          margin: [14, 0, 0, 8],
        },
      ],
    },
    firstPageI.mail_asegurado
      ? {
          stack: [
            {
              text: `Correo electrónico: ${firstPageI.mail_asegurado}`,
              alignment: 'left',
              fontSize: 16,
              margin: [14, 0, 0, 8],
            },
          ],
        }
      : '',
    !firstPageI.poliza || !firstPageI.cobertura
      ? {
          stack: [
            {
              text: 'Datos del seguro',
              alignment: 'center',
              fontSize: 20,
              margin: [0, 14],
            },
          ],
        }
      : '',
    !firstPageI.poliza
      ? {
          stack: [
            {
              text: `Póliza: ${
                firstPageI.n_poliza ? firstPageI.n_poliza : 'Sin definir'
              }`,
              alignment: 'left',
              fontSize: 16,
              margin: [14, 0, 0, 8],
            },
          ],
        }
      : '',
    !firstPageI.cobertura
      ? {
          stack: [
            {
              text: `Cobertura: ${
                firstPageI.tipo_cobertura
                  ? firstPageI.tipo_cobertura
                  : 'Sin definir'
              }`,
              alignment: 'left',
              fontSize: 16,
              margin: [14, 0, 0, 8],
            },
          ],
        }
      : '',
    {
      stack: [
        {
          text: 'Datos del vehículo',
          alignment: 'center',
          fontSize: 20,
          margin: [0, 14],
        },
      ],
    },
    {
      stack: [
        {
          text: `Bien asegurado: ${
            firstPageI.veh_asegurado
              ? firstPageI.veh_asegurado
              : 'No se proveyó'
          }`,
          alignment: 'left',
          fontSize: 16,
          margin: [14, 0, 0, 8],
        },
      ],
    },
    !firstPageI.anio
      ? {
          stack: [
            {
              text: `Año: ${
                firstPageI.text_anio ? firstPageI.text_anio : 'Sin definir'
              }`,
              alignment: 'left',
              fontSize: 16,
              margin: [14, 0, 0, 8],
            },
          ],
        }
      : '',
    !firstPageI.patente
      ? {
          stack: [
            {
              text: `Patente: ${
                firstPageI.patente_asegurado
                  ? firstPageI.patente_asegurado
                  : 'Sin definir'
              }`,
              alignment: 'left',
              fontSize: 16,
              margin: [14, 0, 0, 8],
            },
          ],
        }
      : '',
    firstPageI.hasTerceros
      ? {
          stack: [
            {
              text: firstPageI.conductor
                ? `Conductor: ${firstPageI.conductor}, DNI: ${
                    firstPageI.dni_conductor
                      ? firstPageI.dni_conductor
                      : 'Sin información'
                  }`
                : '',
              alignment: 'left',
              fontSize: 16,
              margin: [14, 0, 0, 8],
            },
          ],
        }
      : '',
    {
      stack: [
        {
          text: '',
          pageBreak: 'after',
        },
      ],
    },
    // Aca hay un salto de pagina
    firstPageI.amp_denuncia
      ? {
          stack: [
            {
              text: 'Ampliación de denuncia',
              alignment: 'center',
              fontSize: 20,
              margin: [0, 20],
            },
          ],
        }
      : '',
    firstPageI.amp_denuncia
      ? {
          stack: [
            {
              text: firstPageI.amp_denuncia,
              alignment: 'left',
              fontSize: 16,
              margin: [14, 0, 0, 10],
              pageBreak: 'after',
            },
          ],
        }
      : '',
  ];
  return content;
};
