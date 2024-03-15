import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const permissions =
  (allowedList: string[]): CanActivateFn =>
  async (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> => {
    const auth = inject(AuthService);
    const router = inject(Router);

    try {
      const user = await auth.returnUserInfo();

      const isAllowed =
        user?.superuser || allowedList.some((p) => user?.rol === p);
      if (!isAllowed) {
        router.navigate(['/home/dashboard'])
        return false
      }
      else return isAllowed;
    } catch (error) {
      console.error('Error al obtener información del usuario:', error);
      return false;
    }
  };
