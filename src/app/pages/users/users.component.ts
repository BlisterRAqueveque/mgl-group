import { Component } from '@angular/core';
import { CardUsersComponent } from './card-users/card-users.component';
import { TableUsersComponent } from './table-users/table-users.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { ModalAddUsersComponent } from './modal-add-users/modal-add-users.component';


@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CardUsersComponent,
    TableUsersComponent,
    ButtonComponent,
    ModalAddUsersComponent,
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent {

}
