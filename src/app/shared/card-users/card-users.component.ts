import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card-users',
  standalone: true,
  imports: [],
  templateUrl: './card-users.component.html',
  styleUrl: './card-users.component.css'
})
export class CardUsersComponent {
  @Input() name!: string
  @Input() description!: string

}
