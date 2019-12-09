import { CommonModule } from '@angular/common';
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { navigatableComponents, routes } from './main.routing';
import { RouterModule } from '@angular/router';
import { MaterialModule } from './material.module';
import { MainComponent } from './main.component';
import { FormsModule } from '@angular/forms';
import { GridModule, SortService, VirtualScrollService } from '@syncfusion/ej2-angular-grids';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { EntrySearchPipe, AddressSearchPipe } from '../utils/pipes';

@NgModule({
  declarations: [MainComponent, EntrySearchPipe, AddressSearchPipe, ...navigatableComponents],
  imports: [CommonModule, RouterModule.forChild(routes), MaterialModule, FormsModule, GridModule, DropDownListModule],
  providers: [SortService, VirtualScrollService],
  schemas: [NO_ERRORS_SCHEMA]
})
export class MainModule {}
