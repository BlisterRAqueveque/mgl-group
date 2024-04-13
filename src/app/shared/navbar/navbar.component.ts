import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { DialogComponent } from '../dialog/dialog.component';
import { RenderDirective } from '../../directives/render.directive';
import { UsuarioI } from '../../interfaces/user-token.interface';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, DialogComponent, RenderDirective],
  providers: [Router],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  @ViewChild('dialog') dialog!: DialogComponent;
  @ViewChild('active') active!: ElementRef<HTMLDivElement>;

  constructor(private readonly auth: AuthService) {}
  user!: UsuarioI | null;
  async ngOnInit() {
    this.user = await this.auth.returnUserInfo();
  }

  show = false;

  logout() {
    this.dialog.confirm('Confirmar', '¿Realmente desear cerrar sesión?', () => {
      this.auth.logout();
    });
  }

  onRouterLinkActive(el: HTMLAnchorElement) {
    this.active.nativeElement.style.left = el.offsetLeft - 10 + 'px';
    this.active.nativeElement.style.top = el.offsetTop - 4 + 'px';
    this.active.nativeElement.style.width = el.offsetWidth + 22 + 'px';
    this.active.nativeElement.style.height = el.offsetHeight + 8 + 'px';
    this.active.nativeElement.classList.add('animate');
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    const item = document.getElementsByClassName('active');
    this.onRouterLinkActive(item[0] as HTMLAnchorElement);
  }
}
