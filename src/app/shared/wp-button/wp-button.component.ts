import { Component } from '@angular/core';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-wp-button',
  standalone: true,
  imports: [RippleModule],
  templateUrl: './wp-button.component.html',
  styleUrl: './wp-button.component.css',
})
export class WpButtonComponent {}
