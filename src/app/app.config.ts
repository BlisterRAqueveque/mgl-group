import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { CookieService } from 'ngx-cookie-service';
import { routes } from './app.routes';
import { jwtInterceptor } from './interceptor/jwt.interceptor';
import { provideLottieOptions } from 'ngx-lottie';
import player from 'lottie-web';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(), //* Arregla el problema con el BrowserAnimationModule
    CookieService,
    provideHttpClient(withInterceptors([jwtInterceptor])),
    provideLottieOptions({
      player: () => player,
    }),
  ],
};
