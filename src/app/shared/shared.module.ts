import { NgModule, CUSTOM_ELEMENTS_SCHEMA, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
  MatTableModule,
  MatSortModule,
  MatAutocompleteModule
} from '@angular/material';

// primeng
import {
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

import { NgxSpinnerModule } from 'ngx-spinner';
import { NgxSpinnerService } from 'ngx-spinner';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
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
    MatSortModule,
    MatAutocompleteModule,

    ProgressBarModule,
    ToolbarModule,
    TabViewModule,
    DataListModule,
    // SidebarModule,
    TreeTableModule,
    PrimeNgSharedModule,
    MenuModule,
    MessagesModule,

    NgxSpinnerModule
  ],
  declarations: [

  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
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
    MatSortModule,
    MatAutocompleteModule,

    ProgressBarModule,
    ToolbarModule,
    TabViewModule,
    DataListModule,
    // SidebarModule,
    TreeTableModule,
    PrimeNgSharedModule,
    MenuModule,
    MessagesModule,

    NgxSpinnerModule
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: [NgxSpinnerService]
    };
  }
}
