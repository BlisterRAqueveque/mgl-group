import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroEyeSolid,
  heroArrowUturnLeftSolid,
  heroArrowUturnRightSolid,
  heroPencilSquareSolid,
} from '@ng-icons/heroicons/solid';
import {
  ImageCroppedEvent,
  ImageCropperModule,
  ImageTransform,
} from 'ngx-image-cropper';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-informes',
  standalone: true,
  imports: [
    ImageCropperModule,
    CommonModule,
    NgIconComponent,
    TooltipModule,
    DialogModule,
    RippleModule,
  ],
  templateUrl: './informes.component.html',
  styleUrl: './informes.component.css',
  providers: [
    provideIcons({
      heroEyeSolid,
      heroArrowUturnLeftSolid,
      heroArrowUturnRightSolid,
      heroPencilSquareSolid,
    }),
  ],
})
export class InformesComponent {

  // ---------------------------------------------------------------------------->
  /**                            Sección de imágenes                            */

  /** @description Lista de imágenes, contiene la imagen que se muestra/guarda, y la original */
  images: {
    img: string;
    comment: string;
    mimeType: string;
    originalImg: string;
  }[] = [];

  /** @description Toma la imagen desde el evento y la transforma en base64 */
  async addImage(event: any, input: HTMLInputElement) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target!.result !== null ? e.target!.result : '';
      //* Se almacenan en la lista
      this.images.push({
        img: imageUrl.toString(),
        comment: '',
        mimeType: 'image/jpeg',
        originalImg: imageUrl.toString(),
      });
    };
    reader.readAsDataURL(event.target.files[0]);
    input.value = '';
  }

  /** @description Controla el estado del dialog */
  visible = false;
  /** @description la imagen que se muestra en el cropper */
  imageToEdit!: any;
  /** @description El index de la imagen original */
  imgIndex!: number;

  /** @description Toma la imagen original, y la manda al cropper para comenzar a editarla */
  editImage(index: number) {
    this.imageToEdit = this.images[index].originalImg;
    //* Almacenamos el index para editar el registro en la lista
    this.imgIndex = index;
    this.visible = true;
  }

  /** @description Sirven para manejar el canvas donde está almacenada la imagen */
  canvasRotation = 0;
  transform: ImageTransform = {};

  /** @description Rotamos la imagen a la izquierda */
  rotateLeft() {
    this.canvasRotation--;
    this.flipAfterRotate();
  }
  /** @description Rotamos la imagen a la derecha */
  rotateRight() {
    this.canvasRotation++;
    this.flipAfterRotate();
  }
  /** @description Se usa antes de realizar la rotación para ajustar la imagen */
  private flipAfterRotate() {
    const flippedH = this.transform.flipH;
    const flippedV = this.transform.flipV;
    this.transform = {
      ...this.transform,
      flipH: flippedV,
      flipV: flippedH,
    };
  }

  /** @description Almacena los cambios de la imagen editada */
  imgResult!: any;
  /** @description Va guardando los cambios de la imagen editada */
  imageCropped(img: ImageCroppedEvent) {
    const reader = new FileReader();
    reader.onload = (event) => {
      this.imgResult = event.target?.result as string;
    };
    reader.readAsDataURL(img.blob!);
    this.imgResult = img.base64;
  }

  /**
   * @description Finaliza la edición de la imagen, guarda el resultado solo donde se
   * almacena la imagen que se va a mostrar. La original queda intacta, en caso de
   * necesitar realizar mas cambios
   **/
  finishImgEdition() {
    this.images[this.imgIndex].img = this.imgResult;
    this.visible = false;
  }
  // ---------------------------------------------------------------------------->
}
