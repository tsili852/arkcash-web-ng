import { Routes } from '@angular/router';

import { LedgerComponent } from './ledger/ledger.component';
import { MainComponent } from './main.component';
import { ConfigurationComponent } from './configuration/configuration.component';
import { ClientsComponent } from './clients/clients.component';

export const routes: Routes = [
  {
    path: 'default',
    component: MainComponent,
    children: [
      { path: '', redirectTo: 'ledger', pathMatch: 'full' },
      { path: 'clients', component: ClientsComponent },
      { path: 'ledger', component: LedgerComponent },
      { path: 'configuration', component: ConfigurationComponent }
    ]
  }
  // { path: '', redirectTo: 'ledger', pathMatch: 'full' },
  // { path: 'ledger', component: LedgerComponent }
];

export const navigatableComponents = [LedgerComponent, ConfigurationComponent, ClientsComponent];
