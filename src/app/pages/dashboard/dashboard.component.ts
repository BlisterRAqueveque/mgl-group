import { Component } from '@angular/core';
import { UsuarioI } from '../../interfaces/user-token.interface';
import { AuthService } from '../../services/auth/auth.service';
import { CardComponent } from '../../shared/card/card.component';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FooterComponent } from './../../shared/footer/footer.component';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AnimationOptions, LottieComponent } from 'ngx-lottie';
import { AnimationItem } from 'lottie-web';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    NavbarComponent,
    CardComponent,
    FooterComponent,
    LottieComponent,
    CommonModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  constructor(private readonly auth: AuthService) {}

  user!: UsuarioI;
  date = new Date();

  async ngOnInit() {
    setInterval(() => {
      this.getFormatDate();
      this.obtenerSaludo();
    }, 1000);
    this.user = (await this.auth.returnUserInfo()) as UsuarioI;
  }

  getFormatDate(): string {
    const date = new Date();
    const formatDate = format(date, 'EEEE dd/MM/yyyy, HH:mm', { locale: es });
    const words = formatDate.split(' ');
    words[0] = this.capitalize(words[0]);
    return words.join(' ');
  }
  capitalize(palabra: string): string {
    return palabra.charAt(0).toUpperCase() + palabra.slice(1);
  }

  change = false;

  /** @description Obtenemos el saludo para mostrar en la pantalla */
  obtenerSaludo() {
    const horaActual = new Date().getHours();
    let saludo: string;
    let path: string;
    if (horaActual >= 6 && horaActual < 12) {
      saludo = 'Buen día';
      path = '/assets/lottie/morning.json';
    } else if (horaActual >= 12 && horaActual <= 19) {
      saludo = 'Buenas tardes';
      path = '/assets/lottie/afternoon.json';
    } else {
      saludo = 'Buenas noches';
      path = '/assets/lottie/night.json';
    }
    if (this.path !== path) {
      this.change = true;
      //* Seteamos estos time out solo para que la animación sea perfecta
      setTimeout(() => {
        this.options = { ...this.options, path: path };
        this.path = path;
      }, 400);
      setTimeout(() => {
        this.change = false;
      }, 500);
    }
    return { saludo, path };
  }

  path!: string;

  options: AnimationOptions = {
    path: this.obtenerSaludo().path,
  };

  animationCreated(animationItem: AnimationItem): void {
    console.log(animationItem);
  }
}
