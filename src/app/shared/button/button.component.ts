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

  @Input() text!: string

}
