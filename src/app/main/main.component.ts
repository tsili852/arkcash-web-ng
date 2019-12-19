import { Component, OnInit, AfterViewInit } from '@angular/core';
import { AuthenticationService, User } from '../shared/authentication';
import { Router, ActivatedRoute } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { NgxIzitoastService } from 'ngx-izitoast';
import { version as applicationVersion } from '../../../package.json';
import { GlobalService } from '../shared/global.service';
import { LocationStrategy } from '@angular/common';

@Component({
  selector: 'app-main',
  templateUrl: './main.html',
  styleUrls: ['./main.scss']
})
export class MainComponent implements OnInit, AfterViewInit {
  promptEvent: any;
  showInstallPopUp = false;
  showInstallPopUpIos = false;
  connectedUser: User;
  selectedUser: User;
  currentRoute = 0;
  appVersion = '';
  showLogoutConfirmation = false;
  isIos = false;

  userCancelInstall = false;

  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly swUpdate: SwUpdate,
    private readonly toastService: NgxIzitoastService,
    private readonly globalService: GlobalService,
    private readonly location: LocationStrategy
  ) {
    this.isIos = this.isPlatformIos();

    this.connectedUser = this.authenticationService.getCurrentUser();
    this.selectedUser = this.globalService.getSelectedUser();
    this.appVersion = applicationVersion;

    this.location.onPopState(() => {
      // console.log(`Back Button`);
    });

    this.globalService.getMenuChoice$().subscribe((choice) => {
      this.currentRoute = choice;
    });

    // if (this.connectedUser.isAdmin) {
    //   this.currentRoute = 0;
    // } else {
    //   this.currentRoute = 1;
    // }

    this.userCancelInstall = this.globalService.getUserCancelInstall();
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

      if (!this.userCancelInstall) {
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

  ngOnInit(): void {
    if (this.isIos && !this.userCancelInstall) {
      this.showInstallPopUpIos = true;
      this.globalService.setUserCancelInstall(true);
    }
  }

  ngAfterViewInit(): void {}

  onResetInstall() {
    this.globalService.resetUserCancelInstall();
    window.location.reload();
  }

  onLogout() {
    this.authenticationService.clearStorage();
    this.router.navigate(['login'], { skipLocationChange: true });
  }

  onInstall() {
    this.showInstallPopUp = false;
    this.promptEvent.prompt();
  }

  onCancel() {
    this.showInstallPopUp = false;
    this.globalService.setUserCancelInstall(true);
  }

  cancelIosInstall() {
    this.showInstallPopUpIos = false;
  }

  onGoToClients() {
    this.router.navigate(['clients'], { relativeTo: this.route });
    this.currentRoute = 0;
  }

  onGoToLedger() {
    // if (this.selectedUser) {
    this.router.navigate(['ledger'], { relativeTo: this.route });
    this.currentRoute = 1;
    // }
  }

  onGoToConfiguration() {
    // if (this.selectedUser) {
    this.router.navigate(['configuration'], { relativeTo: this.route });
    this.currentRoute = 2;
    // }
  }

  onGoToAddMobile() {
    // if (this.selectedUser) {
    this.router.navigate(['add-mobile'], { relativeTo: this.route });
    this.currentRoute = 3;
    // }
  }

  isPlatformIos() {
    const iDevices = ['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'];

    if (!!navigator.platform) {
      while (iDevices.length) {
        if (navigator.platform === iDevices.pop()) {
          return true;
        }
      }
    }

    return false;
  }
}
