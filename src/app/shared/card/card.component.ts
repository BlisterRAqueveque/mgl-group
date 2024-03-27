import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroClipboardDocumentListSolid,
  heroUserGroupSolid,
  heroUserSolid,
  heroBuildingOfficeSolid,
  heroShieldCheckSolid,
} from '@ng-icons/heroicons/solid';

export type Icons =
  | 'heroClipboardDocumentListSolid'
  | 'heroUserGroupSolid'
  | 'heroUserSolid'
  | 'heroBuildingOfficeSolid'
  | 'heroShieldCheckSolid';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [NgIconComponent, CommonModule],
  providers: [
    provideIcons({
      heroClipboardDocumentListSolid,
      heroUserGroupSolid,
      heroUserSolid,
      heroBuildingOfficeSolid,
      heroShieldCheckSolid,
    }),
  ],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css',
})
export class CardComponent {
  @Input() icon!: Icons;
  @Input() text!: string;
  @Input() text_one!: string;
  @Input() text_two!: string;
  @Input() color!: string;
}
