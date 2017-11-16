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
  MatProgressBarModule,
  MatChipsModule,
  MatSidenavModule,
  MatCheckboxModule,
  MatCardModule,
  MatListModule,
  MatIconModule,
  MatTooltipModule,
  MatExpansionModule,
  MatPaginatorModule,
  MatRadioModule,
  MatTableModule
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
  MenuModule,
  MessagesModule
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
    MatProgressBarModule,
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
    MatTableModule,

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
    MessagesModule
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
    MatProgressBarModule,
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
    MatTableModule,

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
    MessagesModule,

  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class SharedModule { }
