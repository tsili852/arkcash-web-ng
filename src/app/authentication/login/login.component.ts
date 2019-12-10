import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthenticationService } from '../../shared/authentication';
import { GlobalService } from '../../shared/global.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent implements OnInit {
  user: {
    username: string;
    password: string;
  };

  usernamePasswordEmpty = false;
  usernameWrong = false;
  loginError = false;
  connectionError = false;

  multipleClients = false;
  noRegisteredClients = false;

  loginToken = '';

  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly router: Router,
    private readonly globalService: GlobalService
  ) {
    this.user = {
      password: '',
      username: ''
    };

    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
    });
  }

  ngOnInit(): void {}

  onLogin() {
    if (this.user.username && this.user.username.trim().length > 0 && this.user.password && this.user.password.trim().length > 0) {
      this.authenticationService.login(this.user).subscribe(
        (res) => {
          this.authenticationService.setToken(res.token);
          const user = this.authenticationService.getCurrentUser();
          if (user.isAdmin) {
            this.router.navigate(['main/default/clients']);
          } else {
            this.globalService.setSelectedUser(user);
            this.router.navigate(['main/default']);
          }
        },
        (error) => {
          this.loginError = true;
          setTimeout(() => {
            this.loginError = false;
          }, 3000);
        }
      );
    } else {
      this.loginError = true;
      setTimeout(() => {
        this.loginError = false;
      }, 3000);
    }
  }
}
