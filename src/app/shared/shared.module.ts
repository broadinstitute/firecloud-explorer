import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MatButtonModule,
  MatToolbarModule,
  MatMenuModule,
  MatSelectModule,
  MatTabsModule,
  MatInputModule,
  MatProgressSpinnerModule,
  MatChipsModule,
  MatSidenavModule,
  MatCheckboxModule,
  MatCardModule,
  MatListModule,
  MatIconModule,
  MatTooltipModule,
  MatExpansionModule,
  MatPaginatorModule,
  MatRadioModule
} from '@angular/material';

// primeng
import {
  ButtonModule,
  CheckboxModule,
  ProgressBarModule,
  ToolbarModule,
  TabViewModule,
  DataListModule,
  // SidebarModule,
  TreeTableModule,
  TreeNode,
  SharedModule as PrimeNgSharedModule,
  MenuModule
} from 'primeng/primeng';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,

    MatButtonModule,
    MatToolbarModule,
    MatSelectModule,
    MatTabsModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatCardModule,
    MatSidenavModule,
    MatCheckboxModule,
    MatListModule,
    MatMenuModule,
    MatIconModule,
    MatTooltipModule,
    MatExpansionModule,
    MatPaginatorModule,
    MatRadioModule,

    ButtonModule,
    CheckboxModule,
    ProgressBarModule,
    ToolbarModule,
    TabViewModule,
    DataListModule,
    // SidebarModule,
    TreeTableModule,
    PrimeNgSharedModule,
    MenuModule
  ],
  declarations: [

  ],
  exports: [
    CommonModule,
    FormsModule,

    MatButtonModule,
    MatMenuModule,
    MatTabsModule,
    MatChipsModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatCardModule,
    MatSidenavModule,
    MatListModule,
    MatSelectModule,
    MatToolbarModule,
    MatIconModule,
    MatTooltipModule,
    MatExpansionModule,
    MatPaginatorModule,
    MatRadioModule,

    ButtonModule,
    CheckboxModule,
    ProgressBarModule,
    ToolbarModule,
    TabViewModule,
    DataListModule,
    // SidebarModule,
    TreeTableModule,
    PrimeNgSharedModule,
    MenuModule,

  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class SharedModule { }
