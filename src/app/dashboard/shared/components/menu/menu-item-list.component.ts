/** 23112020 - Gaurav - Init version: Reusable, dynamic menu item list component */
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ChildMenuItem, SelectedMenuItem } from './menu.model';

@Component({
  selector: 'app-menu-item-list',
  template: `
    <mat-nav-list dense *ngFor="let m of menuItemValuesArray">
      <app-menu-item
        *ngIf="!m.hidden"
        [selectedMenuItem]="selectedMenuItem"
        [menuItemValues]="m"
        (menuItemClicked)="onListMenuItemClicked($event)"
      ></app-menu-item>
    </mat-nav-list>
  `,
  styleUrls: ['./menu.component.css'],
})
export class MenuItemListComponent {
  /** Decision props */
  @Input() selectedMenuItem!: number;
  @Output() menuListItemClicked = new EventEmitter<SelectedMenuItem>();

  /** Value props */
  @Input() menuItemValuesArray!: ChildMenuItem[];

  /** Pass back the current list menu item selection to the caller */
  onListMenuItemClicked($event: SelectedMenuItem): void {
    this.menuListItemClicked.emit($event);
  }
}
