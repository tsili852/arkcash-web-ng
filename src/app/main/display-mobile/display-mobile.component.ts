import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';

import { Entry, EntryItem, EntryService } from '../../shared/entry';
import { Address, AddressService } from '../../shared/address';
import { Category, CategoryService } from '../../shared/category';
import { GlobalService } from '../../shared/global.service';
import { AuthenticationService, User } from '../../shared/authentication';
import { Observable } from 'rxjs';

@Component({
  templateUrl: './display-mobile.html',
  styleUrls: ['./display-mobile.scss']
})
export class DisplayMobileComponent implements OnInit {
  selectedMode = 2;

  connectedUser: User;
  logedinUser: User;

  selectedEntry: Entry;
  selectedEntryItems: EntryItem[];
  selectedEntryAddress: Address;
  selectedEntryInOut = '1';

  totalAmount = 0.0;

  constructor(
    private readonly entryService: EntryService,
    private readonly router: Router,
    private readonly addressService: AddressService,
    private readonly categoryService: CategoryService,
    private readonly globalService: GlobalService,
    private readonly route: ActivatedRoute,
    private readonly authenticationService: AuthenticationService
  ) {
    this.route.queryParams.subscribe((params) => {
      if (params && params.entryId) {
        const entryId = params.entryId;
        this.entryService.getEntry(entryId).subscribe((entry) => {
          this.selectedEntry = entry;
          this.selectedEntryItems = entry.entryitems;
          this.selectedEntryAddress = entry.address;
          this.totalAmount = entry.totalAmount;
          this.calculateEntryTotal();

          const storedInOut = this.selectedEntry.inout === -1 ? 1 : 2;
          if (storedInOut) {
            this.selectedMode = storedInOut;
            this.selectedEntryInOut = storedInOut.toString();
          }
        });
      } else {
        this.router.navigate(['../ledger'], { relativeTo: this.route });
      }
    });

    this.connectedUser = this.globalService.getSelectedUser();
    this.logedinUser = this.authenticationService.getCurrentUser();

    if (this.logedinUser.isAdmin) {
      if (!this.connectedUser) {
        this.router.navigate(['../clients'], { relativeTo: this.route });
      }
    } else {
      this.connectedUser = this.authenticationService.getCurrentUser();
      this.globalService.setSelectedUser(this.connectedUser);
    }

    this.globalService.updateMenuItem(4);
  }

  ngOnInit(): void {}

  onGoToLedger() {
    this.router.navigate(['../ledger'], { relativeTo: this.route });
  }

  private calculateEntryTotal() {
    this.totalAmount = 0.0;

    this.selectedEntry.entryitems.forEach((item) => {
      if (item.amount) {
        const itemAmount: string = item.amount.toString();
        this.totalAmount = this.totalAmount + parseFloat(itemAmount);
      }
    });
  }
}
