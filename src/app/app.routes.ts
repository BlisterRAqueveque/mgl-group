import { Routes } from '@angular/router';
import { AseguradorasComponent } from './pages/aseguradoras/aseguradoras.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { PericiasComponent } from './pages/pericias/pericias.component';
import { UsersComponent } from './pages/users/users.component';
import { SiniestrosComponent } from './pages/siniestros/siniestros.component';
import { authGuard } from './guards/login.guard';
import { InformesComponent } from './pages/informes/informes.component';
import { permissions } from './guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // redirect to `first-component`
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: HomeComponent,
    canActivate: [authGuard],
    children: [
      { path: 'home', component: DashboardComponent },
      { path: 'pericias', component: PericiasComponent },
      { path: 'asesores', component: UsersComponent },
      { path: 'aseguradoras', component: AseguradorasComponent, canActivate: [ permissions(['admin']) ] },
      { path: 'siniestros', component: SiniestrosComponent, canActivate: [ permissions(['admin']) ] },
      { path: 'informes', component: InformesComponent },
      // { path: 'informes/:id', component: InformesComponent }, //! Se usó un query param
    ],
  },
];
