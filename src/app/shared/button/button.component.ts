import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroPlusCircleSolid,
} from '@ng-icons/heroicons/solid';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [
    NgIconComponent,
    RippleModule,
    CommonModule,
  ],
  providers: [
    provideIcons({
      heroPlusCircleSolid,
    }),
  ],
  templateUrl: './button.component.html',
  styleUrl: './button.component.css'
})
export class ButtonComponent {

  @Input() moreWidth = false

  @Input() text!: string

}
