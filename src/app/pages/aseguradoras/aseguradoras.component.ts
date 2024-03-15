import { Component } from '@angular/core';
import { ButtonComponent } from '../../shared/button/button.component';
import { ModalAddAseguradoraComponent } from './modal-add-aseguradora/modal-add-aseguradora.component';
import { TableAseguradorasComponent } from './table-aseguradoras/table-aseguradoras.component';
import { CardUsersComponent } from '../users/card-users/card-users.component';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-aseguradoras',
  standalone: true,
  imports: [
    CardUsersComponent,
    ModalAddAseguradoraComponent,
    ButtonComponent,
    TableAseguradorasComponent,
  ],
  templateUrl: './aseguradoras.component.html',
  styleUrl: './aseguradoras.component.css',
})
export class AseguradorasComponent {
  constructor(private auth: AuthService) {
    auth.returnUserInfo().then((data) => {
      console.log(data)
    })
  }
}
