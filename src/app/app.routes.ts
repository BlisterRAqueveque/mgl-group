import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { PericiasComponent } from './pages/pericias/pericias.component';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
    { path: '',   redirectTo: '/login', pathMatch: 'full' }, // redirect to `first-component`
    { path: 'login', component: LoginComponent },
    { path: 'home', component: HomeComponent, children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'pericias', component: PericiasComponent }
    ] },

];
