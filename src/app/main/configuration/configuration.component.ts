import { Component, OnInit } from '@angular/core';
import { AuthenticationService, User } from '../../shared/authentication';
import { Address, AddressService } from '../../shared/address';
import { Category, CategoryService } from '../../shared/category';

@Component({
  templateUrl: './configuration.html',
  styleUrls: ['./configuration.scss']
})
export class ConfigurationComponent implements OnInit {
  connectedUser: User;

  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly addressService: AddressService,
    private readonly categoryService: CategoryService
  ) {
    this.connectedUser = this.authenticationService.getCurrentUser();
  }

  ngOnInit(): void {}
}
