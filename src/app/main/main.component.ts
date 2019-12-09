import { Component, OnInit } from '@angular/core';
import { AuthenticationService, User } from '../shared/authentication';
import { Router, ActivatedRoute } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { NgxIzitoastService } from 'ngx-izitoast';

import { GlobalService } from '../shared/global.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.html',
  styleUrls: ['./main.scss']
})
export class MainComponent implements OnInit {
  promptEvent: any;
  showInstallPopUp = false;
  connectedUser: User;
  currentRoute = 0;

  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly swUpdate: SwUpdate,
    private readonly toastService: NgxIzitoastService,
    private readonly globalService: GlobalService
  ) {
    this.connectedUser = this.authenticationService.getCurrentUser();

    const routerUrl = this.router.url;
    if (routerUrl.search('ledger') > 0) {
      this.currentRoute = 0;
    } else {
      this.currentRoute = 1;
    }

    window.addEventListener('online', () => {
      this.toastService.success({
        title: 'Connexion restaurée',
        position: 'topLeft'
      });
    });

    window.addEventListener('offline', () => {
      this.toastService.error({
        title: 'Pas de connexion Internet',
        position: 'topLeft'
      });
    });

    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.promptEvent = event;

      if (!this.globalService.getUserCancelInstall()) {
        this.showInstallPopUp = true;
      }
    });

    if (this.swUpdate.isEnabled) {
      this.swUpdate.checkForUpdate();
    }

    this.swUpdate.available.subscribe((event) => {
      console.log('current version is', event.current);
      console.log('available version is', event.available);

      this.swUpdate.activateUpdate().then(() => document.location.reload());
    });

    this.swUpdate.activated.subscribe((event) => {
      console.log('old version was', event.previous);
      console.log('new version is', event.current);
    });
  }

  ngOnInit(): void {}

  onLogout() {
    this.authenticationService.clearStorage();
    this.router.navigate(['login']);
  }

  onInstall() {
    this.showInstallPopUp = false;
    this.promptEvent.prompt();
  }

  onCancel() {
    this.showInstallPopUp = false;
    this.globalService.setUserCancelInstall(true);
  }

  onGoToLedger() {
    this.router.navigate(['ledger'], { relativeTo: this.route });
    this.currentRoute = 0;
  }

  onGoToConfiguration() {
    this.router.navigate(['configuration'], { relativeTo: this.route });
    this.currentRoute = 1;
  }
}
