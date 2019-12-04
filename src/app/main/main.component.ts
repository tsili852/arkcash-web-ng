import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../shared/authentication';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main.html',
  styleUrls: ['./main.scss']
})
export class MainComponent implements OnInit {
  constructor(private readonly authenticationService: AuthenticationService, private readonly router: Router) {}

  ngOnInit(): void {}

  onLogout() {
    this.authenticationService.clearStorage();
    this.router.navigate(['login']);
  }
}
