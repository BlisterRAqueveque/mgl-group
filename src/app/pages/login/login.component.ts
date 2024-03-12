import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroEyeSlashSolid, heroEyeSolid } from '@ng-icons/heroicons/solid';
import { AuthService } from '../../services/auth/auth.service';
import { DialogComponent } from '../../shared/dialog/dialog.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    NgIconComponent,
    CommonModule,
    DialogComponent,
  ],
  providers: [
    provideIcons({
      heroEyeSolid,
      heroEyeSlashSolid,
    })
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  @ViewChild('dialog') dialog!: DialogComponent

  show = false

  constructor(
    private router: Router,
    private readonly auth: AuthService,
  ) {}

  login(ev: Event, username: string, password: string) {
    this.dialog.loading = true
    ev.preventDefault()
    this.auth.login(username, password).subscribe({
      next: data => {
        this.dialog.loading = false
        console.log(data)
    },
    error: e => {
      console.log(e)
    }
  })
  }
}
