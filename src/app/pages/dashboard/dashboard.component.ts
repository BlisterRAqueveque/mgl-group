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
import { DashboardService } from '../../services/dashboard/dashboard.service';
import { DashboardI } from '../../interfaces/dashboard.interface';
import { RenderDirective } from '../../directives/render.directive';
import { HttpParams } from '@angular/common/http';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroCalendarSolid,
  heroUserCircleSolid,
} from '@ng-icons/heroicons/solid';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    NavbarComponent,
    CardComponent,
    FooterComponent,
    LottieComponent,
    CommonModule,
    RenderDirective,
    NgIconComponent,
  ],
  providers: [provideIcons({ heroCalendarSolid, heroUserCircleSolid })],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  constructor(
    private readonly auth: AuthService,
    private readonly dashboardService: DashboardService
  ) {}

  user!: UsuarioI;
  date = new Date();
  dashboard!: DashboardI;

  async ngOnInit() {
    //* Modifica gradualmente el tiempo transcurrido
    setInterval(() => {
      this.getFormatDate();
      this.obtenerSaludo();
    }, 1000);
    this.user = (await this.auth.returnUserInfo()) as UsuarioI;
    let params = new HttpParams();
    if (this.user.rol !== 'admin')
      params = params.set('verificador', this.user?.id!);
    this.dashboardService.getDashboard(params).subscribe({
      next: (data) => {
        this.dashboard = data;
      },
      error: (e) => {
        console.error(e);
      },
    });

    this.getInformeData();
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
    //console.error(animationItem);
  }

  cantidad = 10;
  usuarios: UsuarioI[] = [];
  getInformeData() {
    const { lunes, domingo } = this.obtenerFechasLunesYDomingo();
    let params = new HttpParams();
    if (this.user.rol !== 'admin') {
      params = params.set('usuario', this.user.id!);
    }
    params = params.set('desde', lunes.toString());
    params = params.set('hasta', domingo.toString());
    this.dashboardService.getInformeData(params).subscribe({
      next: (data) => {
        this.cantidad = data.count;
        this.usuarios = data.data;
      },
      error: (e) => {
        console.error(e);
      },
    });
  }

  obtenerFechasLunesYDomingo(): { lunes: Date; domingo: Date } {
    const fechaActual = new Date();
    const diaActual = fechaActual.getDay(); // 0 (Domingo) a 6 (Sábado)
    let offsetLunes = 0;
    if (diaActual === 0) {
      offsetLunes = -6; // Si es domingo, retrocede 6 días al lunes de esta semana
    } else {
      offsetLunes = 1 - diaActual; // Retrocede al lunes de esta semana
    }

    const lunes = new Date();
    lunes.setDate(fechaActual.getDate() + offsetLunes);

    const domingo = new Date(lunes);
    while (domingo.getDay() !== 0) {
      domingo.setDate(domingo.getDate() + 1);
    }
    domingo.setDate(domingo.getDate() + 1);

    return { lunes, domingo };
  }
}
