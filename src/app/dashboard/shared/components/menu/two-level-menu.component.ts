/** 23112020 - Gaurav - Init version: Two-level Menu Item component.
 * STRICTLY!!! First => PARENT, Second => List of CHILD Menu Items
 * I've used the non-null assertion operator on the menuItems array to assure typescript compilation errors that a non-null values shall be passed.
 * See the bottom of this file for the error without the ! mark. */
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TwoLevelParentMenuItem, SelectedMenuItem } from './menu.model';

@Component({
  selector: 'app-two-level-menu',
  template: `
    <mat-expansion-panel
      (opened)="onMenuOpened()"
      [expanded]="selectedMenu === parentMenuItem?.menuId"
      [ngClass]="[
        'mat-elevation-z0',
        selectedMenu === parentMenuItem?.menuId
          ? 'expanded-bgcolor'
          : 'collapsed-bgcolor'
      ]"
    >
      <mat-expansion-panel-header>
        <mat-panel-title
          [ngClass]="[
            selectedMenu === parentMenuItem?.menuId
              ? 'expanded-textcolor'
              : 'collapsed-textcolor'
          ]"
          ><mat-icon>{{ parentMenuItem?.menuIcon }}</mat-icon
          >{{ parentMenuItem?.menuName }}</mat-panel-title
        >
      </mat-expansion-panel-header>
      <app-menu-item-list
        [menuItemValuesArray]="parentMenuItem?.menuItems!"
        [selectedMenuItem]="selectedChildMenu"
        (menuListItemClicked)="onMenuItemClicked($event)"
      ></app-menu-item-list>
    </mat-expansion-panel>
  `,
  styleUrls: ['./menu.component.css'],
})
export class TwoLevelMenuComponent {
  /** Decision props */
  @Input() selectedMenu!: number;
  @Input() selectedChildMenu!: number;

  @Output() menuOpened = new EventEmitter<void>();
  @Output() menuItemClicked = new EventEmitter<SelectedMenuItem>();

  /** Value props */
  @Input() parentMenuItem!: TwoLevelParentMenuItem;

  onMenuOpened(): void {
    this.menuOpened.emit();
  }

  onMenuItemClicked(event: SelectedMenuItem): void {
    this.menuItemClicked.emit(event);
  }
}

/** 
 * Error: src/app/dashboard/features/ask-buddy/ask-buddy-menu.component.ts:32:9 - error TS2322: Type 'MenuItem[] | undefined' is not assignable to type 'MenuItem[]'.
      Type 'undefined' is not assignable to type 'MenuItem[]'.
      [menuItemValuesArray]="parentMenuItem?.menuItems"
 * 
*/
