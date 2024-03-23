import { inject } from '@angular/core';
import { CanActivateFn, CanDeactivateFn, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../services/auth/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const cookie = inject(CookieService)
  const router = inject(Router)
  const auth = inject(AuthService)

  const token = cookie.getAll()['x-token'] ? cookie.getAll()['x-token'] : route.queryParamMap.get('token')
  try {
    //const ok = await firstValueFrom(auth.checkToken(token!))
    if (token) return true
    else {
      router.navigate(['login'])
      return false
    };
  } catch (error) {
    router.navigate(['login'])
    return false
  }
};


export const deactivateGuard: CanDeactivateFn<unknown> = (component, currentRoute, currentState, nextState) => {
  return true
};
