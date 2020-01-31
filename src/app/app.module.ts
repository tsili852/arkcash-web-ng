import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID, ErrorHandler } from '@angular/core';
import { DatePipe, DecimalPipe, registerLocaleData } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxIziToastModule } from 'ngx-izitoast';

import localeFrCH from '@angular/common/locales/fr-CH';
import localeFrCHExtra from '@angular/common/locales/extra/fr-CH';

import localeDeCH from '@angular/common/locales/de-CH';

import { navigatableComponents, routes, authProviders } from './app.routing';
import { AppComponent } from './app.component';

import { AuthenticationService } from './shared/authentication/authentication.service';
import { CategoryService } from './shared/category';
import { AddressService } from './shared/address';
import { DrawerService } from './shared/drawer';
import { EntryService } from './shared/entry';
import { GlobalService } from './shared/global.service';
import { TrafficInterceptor } from './utils/interceptor';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

registerLocaleData(localeDeCH, 'de-CH');
registerLocaleData(localeFrCH, 'fr-CH', localeFrCHExtra);

@NgModule({
  declarations: [AppComponent, ...navigatableComponents],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    NgxIziToastModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [
    DatePipe,
    DecimalPipe,
    authProviders,
    AuthenticationService,
    CategoryService,
    AddressService,
    DrawerService,
    EntryService,
    GlobalService,
    { provide: HTTP_INTERCEPTORS, useClass: TrafficInterceptor, multi: true },
    { provide: LOCALE_ID, useValue: 'de-CH' },
    { provide: LOCALE_ID, useValue: 'fr-CH' }
  ],
  bootstrap: [AppComponent],
  exports: [FormsModule, BrowserModule]
})
export class AppModule {}
