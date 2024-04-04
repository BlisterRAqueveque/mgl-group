import { Component, Input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { RippleModule } from 'primeng/ripple';
import {
  heroPlusCircleSolid,
  heroDocumentSolid,
  heroMagnifyingGlassSolid,
  heroArrowDownOnSquareSolid,
} from '@ng-icons/heroicons/solid';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-button-multiple',
  standalone: true,
  imports: [RippleModule, NgIcon, CommonModule, FormsModule, TooltipModule],
  providers: [
    provideIcons({
      heroPlusCircleSolid,
      heroDocumentSolid,
      heroMagnifyingGlassSolid,
      heroArrowDownOnSquareSolid,
    }),
  ],
  templateUrl: './button-multiple.component.html',
  styleUrl: './button-multiple.component.css',
})
export class ButtonMultipleComponent {
  show = false;

  @Input() viewPdf!: Function

  setViewPdf() {
    this.viewPdf()
  }
}
