import { Component } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroDocumentSolid } from '@ng-icons/heroicons/solid';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-pdf-button',
  standalone: true,
  imports: [NgIconComponent, RippleModule],
  providers: [
    provideIcons({
      heroDocumentSolid,
    }),
  ],
  templateUrl: './pdf-button.component.html',
  styleUrl: './pdf-button.component.css',
})
export class PdfButtonComponent {}
