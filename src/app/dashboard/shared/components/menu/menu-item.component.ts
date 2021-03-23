/** 23112020 - Gaurav - Init version: Reusable, dynamic menu item component */
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ChildMenuItem, SelectedMenuItem } from './menu.model';

@Component({
  selector: 'app-menu-item',
  template: `
    <a
      mat-list-item
      (click)="onClick()"
      class="child-menu-item"
      [ngClass]="[
        selectedMenuItem === menuItemValues?.menuItemLevelId
          ? 'selected'
          : 'unselected',
        menuItemValues?.disabled ? 'disabled' : ''
      ]"
      [disabled]="menuItemValues?.disabled"
    >
      <mat-icon *ngIf="menuItemValues?.menuItemIcon">{{
        menuItemValues?.menuItemIcon
      }}</mat-icon>
      <!-- 23112020 - Gaurav - Align menu item text if there is no icon specified -->
      <span
        [ngStyle]="{
          'margin-left': !menuItemValues?.menuItemIcon ? '20px' : 'inherit'
        }"
        >{{ menuItemValues?.menuItemName }}</span
      >
    </a>
  `,
  styleUrls: ['./menu.component.css'],
})
export class MenuItemComponent {
  /** Decision props */
  @Input() selectedMenuItem!: number;
  @Output() menuItemClicked = new EventEmitter<SelectedMenuItem>();

  /** Value props */
  @Input() menuItemValues!: ChildMenuItem;

  /** Pass the current selection to the caller */
  onClick(): void {
    this.menuItemClicked.emit({
      menuItemLevelId: this.menuItemValues.menuItemLevelId,
      routerLink: this.menuItemValues.routerLink,
    });
  }
}
