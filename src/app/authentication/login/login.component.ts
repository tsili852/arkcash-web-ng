import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../shared/authentication';
import { Router } from '@angular/router';

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

  constructor(private readonly authenticationService: AuthenticationService, private readonly router: Router) {
    this.user = {
      password: '',
      username: ''
    };
  }

  ngOnInit(): void {}

  onLogin() {
    if (this.user.username && this.user.username.trim().length > 0 && this.user.password && this.user.password.trim().length > 0) {
      this.authenticationService.login(this.user).subscribe(
        (res) => {
          this.authenticationService.setToken(res.token);
          this.router.navigate(['main/default']);
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
