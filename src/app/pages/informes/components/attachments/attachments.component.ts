import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  ImageCroppedEvent,
  ImageCropperModule,
  ImageTransform,
} from 'ngx-image-cropper';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { RippleModule } from 'primeng/ripple';
import { DialogComponent } from '../../../../shared/dialog/dialog.component';
import {
  heroEyeSolid,
  heroArrowUturnLeftSolid,
  heroArrowUturnRightSolid,
  heroPencilSquareSolid,
  heroTrashSolid,
  heroPlusCircleSolid,
  heroMagnifyingGlassSolid,
  heroDocumentSolid,
  heroArrowsPointingOutSolid,
  heroArrowDownOnSquareSolid,
  heroDocumentCheckSolid,
} from '@ng-icons/heroicons/solid';
import { convertFileToBase64 } from '../../../../tools/file-to-base64';

@Component({
  selector: 'app-attachments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    NgIconComponent,
    ImageCropperModule,
    RippleModule,
    InputTextModule,
    InputTextareaModule,
    DragDropModule,
    DialogModule,
    DialogComponent,
  ],
  templateUrl: './attachments.component.html',
  styleUrl: './attachments.component.css',
  providers: [
    provideIcons({
      heroEyeSolid,
      heroArrowUturnLeftSolid,
      heroArrowUturnRightSolid,
      heroPencilSquareSolid,
      heroTrashSolid,
      heroPlusCircleSolid,
      heroMagnifyingGlassSolid,
      heroDocumentSolid,
      heroArrowsPointingOutSolid,
      heroArrowDownOnSquareSolid,
      heroDocumentCheckSolid,
    }),
  ],
})
export class AttachmentsComponent {
  @Input() title: string = 'Imágenes';
  @Input() helpText!: string;
  /** @description Lista de imágenes, contiene la imagen que se muestra/guarda, y la original */
  @Input() images: {
    id: number;
    img: string;
    comment: string;
    type: string;
    dot: { name: string; code: string } | undefined;
    mimeType: string;
    originalImg: string;
    edited: boolean;
  }[] = [];

  /** @description Define el tipo de imagen */
  @Input() type!: string;
  @Input() readonly = false;

  @ViewChild('dialog') dialog!: DialogComponent;
  /** @description Toma la imagen desde el evento y la transforma en base64 */
  async addImage(event: any, input: HTMLInputElement) {
    const files = event.target.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target!.result !== null ? e.target!.result : '';
          //* Se almacenan en la lista
          this.images.push({
            id: 0,
            img: imageUrl.toString(),
            dot: undefined,
            comment: '',
            type: this.type,
            mimeType: 'image/jpeg',
            originalImg: imageUrl.toString(),
            edited: false,
          });
          this.hasChange.emit(this.type);
        };
        reader.readAsDataURL(file);
      }
    }
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
    this.images[this.imgIndex].edited = true;
    this.visible = false;
  }

  /** @description Borra la imagen seleccionada */
  deleteImg(index: number) {
    this.dialog.confirm(
      'Tratar con cuidado.',
      '¿Realmente desea eliminar la imagen seleccionada? Esta acción es irreversible.',
      () => {
        this.images.splice(index, 1);
      }
    );
  }

  /** @description Retorna el objeto arrastrado en un evento */
  moveImg(
    dropEvent: CdkDragDrop<
      {
        id: number;
        img: string;
        comment: string;
        type: string;
        dot: { name: string; code: string } | undefined;
        mimeType: string;
        originalImg: string;
        edited: boolean;
      }[]
    >
  ) {
    //! Accedemos a las propiedades del objeto => dropEvent.container.data
    const { container, previousIndex, currentIndex } = dropEvent;
    if (previousIndex === currentIndex) return;
    this.reorderImages(container.data, previousIndex, currentIndex);
  }
  /** @description Reordena la lista, son funciones del mismo componente importado */
  reorderImages(
    data: {
      img: string;
      comment: string;
      mimeType: string;
      originalImg: string;
    }[],
    previousIndex: number,
    currentIndex: number
  ) {
    moveItemInArray(data, previousIndex, currentIndex);
    //! EMITIMOS UN EVENTO POR EL CAMBIO DE IMAGEN
    this.hasChange.emit(this.type);
  }
  // ---------------------------------------------------------------------------->

  // --------------------------------------------------------------------------->
  /**                    Eventos drop para la carga de imágenes                */
  isDragging = false;
  @HostListener('dragenter', ['$event'])
  onDragEnter(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  @HostListener('drop', ['$event'])
  async onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const adjunto = await convertFileToBase64(files[i]);
        this.images.push({
          id: 0,
          img: adjunto,
          dot: undefined,
          comment: '',
          type: this.type,
          mimeType: 'image/jpeg',
          originalImg: adjunto,
          edited: false,
        });
        this.hasChange.emit(this.type);
      }
    }
  }
  // --------------------------------------------------------------------------->
  @Output() hasChange = new EventEmitter<string>();
  changeImages() {
    this.hasChange.emit(this.type);
  }
}
