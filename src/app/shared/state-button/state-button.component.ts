import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-state-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './state-button.component.html',
  styleUrl: './state-button.component.css',
})
export class StateButtonComponent {
  @Input() estado!: boolean;
}
