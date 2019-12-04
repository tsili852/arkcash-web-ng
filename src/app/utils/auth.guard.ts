import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';

import { AuthenticationService } from '../shared/authentication/authentication.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly router: Router, private readonly authenticationService: AuthenticationService) {}

  canActivate() {
    const token = this.authenticationService.getToken();

    if (token) {
      return true;
    } else {
      this.router.navigate(['login']);
      this.authenticationService.clearStorage();
      return false;
    }
  }
}
