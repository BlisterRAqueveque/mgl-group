import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  inject,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

@Directive({
  selector: '[render]',
  standalone: true,
})
export class RenderDirective {
  @Input() set render(allowedTypes: string[]) {
    this.checkType(allowedTypes).then((isAllowed) => {
      if (isAllowed) this.viewContainer.createEmbeddedView(this.templateRef);
      else this.viewContainer.clear();
    });
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private readonly auth: AuthService
  ) {}

  private async checkType(allowedTypes: string[]): Promise<boolean> {
    const user = await this.auth.returnUserInfo();
    return allowedTypes.some((item) => item === user?.rol);
  }
}
