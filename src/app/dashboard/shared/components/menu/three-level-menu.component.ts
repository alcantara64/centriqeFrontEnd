/** 23112020 - Gaurav - Init version: Three-level Menu Item component.
 * STRICTLY!!! First => PARENT,
 * Second => (List of CHILD Menu Items) OR (drop-down menu => List of CHILD Menu Items)
 * I've used the non-null assertion operator on the menuItems array to assure typescript compilation errors that a non-null values shall be passed.
 * See the bottom of this file for the error without the ! mark.
 *
 * For top-level menu item to remain expaneded or collapsed, i.e. with (parentMenuItem?.menuId === 1), following logic is applied -
 * check that current top-level menu (ie. 1) and compare it with the selected and truncated 2nd level menu i.e. trunc(1.1) or trunc(1.2)
 *
 * NO CHANGE in selectedChildMenu usage because those are the low-level routing menu items, either child of a 2nd level dropdown menu or direct child of the top-level. Their menu ID is stored in (menuItemLevelId) and is either 1.11 (drop-down child) OR 1.3 (direct)
 * 18022021 - Abhishek - JIRA-CA-167: Render dashboards on UI -> Added conditions for menu it self ans menu with sub menus(for Analytics).
 *  */
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
} from '@angular/core';
import { ThreeLevelParentMenuItem, SelectedMenuItem } from './menu.model';

@Component({
  selector: 'app-three-level-menu',
  template: `
    <mat-expansion-panel
      (opened)="onMenuOpened(parentMenuItem?.menuId)"
      [expanded]="isTopLevelMenuSelected"
      [ngClass]="[
        'mat-elevation-z0',
        isTopLevelMenuSelected ? 'expanded-bgcolor' : 'collapsed-bgcolor'
      ]"
    >
      <mat-expansion-panel-header>
        <mat-panel-title
          [ngClass]="[
            isTopLevelMenuSelected
              ? 'expanded-textcolor'
              : 'collapsed-textcolor'
          ]"
          ><mat-icon>{{ parentMenuItem?.menuIcon }}</mat-icon
          >{{ parentMenuItem?.menuName }}</mat-panel-title
        >
      </mat-expansion-panel-header>

      <!-- Drop-Down items, with their child links -->
      <mat-accordion #dropDownAccordion>
        <ng-container  >
        <mat-expansion-panel *ngFor="let dropDownMenuItem of parentMenuItem?.dropDownMenuItems;let i=index"
          (opened)="onMenuOpened(dropDownMenuItem?.menuId)"
          [expanded]="selectedMenu === dropDownMenuItem?.menuId"
          [ngClass]="[
            'mat-elevation-z0',
            'expanded-bgcolor',
            'child-expansion-panel'
          ]"
        >
          <mat-expansion-panel-header>
            <mat-panel-title
              [ngClass]="['expanded-textcolor', 'child-expansion-panel-title']"
              ><mat-icon>{{ dropDownMenuItem?.menuIcon }}</mat-icon
              >{{ dropDownMenuItem?.menuName }}</mat-panel-title
            >
          </mat-expansion-panel-header>
          <app-menu-item-list
            [menuItemValuesArray]="dropDownMenuItem?.menuItems!"
            [selectedMenuItem]="selectedChildMenu"
            (menuListItemClicked)="onMenuItemClicked($event)"
          ></app-menu-item-list>
        </mat-expansion-panel>
        </ng-container>
      </mat-accordion>

      <!-- Direct child items with links -->
      <app-menu-item-list
        [menuItemValuesArray]="parentMenuItem?.directMenuItems!"
        [selectedMenuItem]="selectedChildMenu"
        (menuListItemClicked)="onMenuItemClicked($event)"
      ></app-menu-item-list>
    </mat-expansion-panel>
  `,
  styleUrls: ['./menu.component.css'],
})
export class ThreeLevelMenuComponent implements OnChanges {
  /** Decision props */
  isTopLevelMenuSelected: boolean = false;
  @Input() selectedMenu!: number;
  @Input() selectedChildMenu!: number;

  @Output() menuOpened = new EventEmitter<number>();
  @Output() menuItemClicked = new EventEmitter<SelectedMenuItem>();

  /** Value props */
  @Input() parentMenuItem!: ThreeLevelParentMenuItem;

  /** 23112020 - Gaurav - Moved code from onInit to onChanges to fix a bug
   * which did not collapse the top-level menu item (expansion panel) when the Home button (a card) was clicked.
   * Hope no performance issue occurs due to this code, needs to be reviewed in future! */
  ngOnChanges() {
    this.isTopLevelMenuSelected =
      Math.trunc(this.selectedMenu) === this.parentMenuItem?.menuId;
  }

  /** Passed number or any for the typescript assignment error TS2345, as below */
  onMenuOpened(event: number | any): void {
    this.menuOpened.emit(event);
  }

  onMenuItemClicked(event: SelectedMenuItem): void {
    this.menuItemClicked.emit(event);
  }
}

/**
 * error TS2345: Argument of type 'number | undefined' is not assignable to parameter of type 'number'.
 *
 */
