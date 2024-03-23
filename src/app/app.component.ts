import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PrimeNGConfig } from 'primeng/api';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  constructor(
    private primengConfig: PrimeNGConfig,
    private translateService: TranslateService
  ) {}

  ngOnInit() {
    this.primengConfig.ripple = true;
    this.translateService.setDefaultLang('es');
    this.translate('es');
  }

  translate(lang: string) {
    this.translateService.use(lang);
    this.translateService
      .get('primeng')
      .subscribe((res) => this.primengConfig.setTranslation(res));
  }

  title = 'mgl-group';
}
