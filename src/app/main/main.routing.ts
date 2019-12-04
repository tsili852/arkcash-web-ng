import { Routes } from '@angular/router';

import { LedgerComponent } from './ledger/ledger.component';
import { MainComponent } from './main.component';

export const routes: Routes = [
  {
    path: 'default',
    component: MainComponent,
    children: [
      { path: '', redirectTo: 'ledger', pathMatch: 'full' },
      { path: 'ledger', component: LedgerComponent }
    ]
  }
  // { path: '', redirectTo: 'ledger', pathMatch: 'full' },
  // { path: 'ledger', component: LedgerComponent }
];

export const navigatableComponents = [LedgerComponent];
