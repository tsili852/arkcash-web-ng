import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';

import { Entry, EntryItem, EntryService } from '../../shared/entry';
import { SearchTerms } from '../../shared/search-terms/search-terms';
import { Utilities } from '../../utils/utilities';
import { Drawer, DrawerService } from '../../shared/drawer';
import { Address, AddressService } from '../../shared/address';
import { Category, CategoryService } from '../../shared/category';
import { GlobalService } from '../../shared/global.service';
import { User, AuthenticationService } from '../../shared/authentication';
import { Observable } from 'rxjs';
import { NgScrollbar } from 'ngx-scrollbar';

@Component({
  templateUrl: './edit-mobile.html',
  styleUrls: ['./edit-mobile.scss']
})
export class EditMobileComponent implements OnInit {
  @ViewChild(NgScrollbar, { static: true }) scrollable: NgScrollbar;

  selectedMode = 1;

  connectedUser: User;
  logedinUser: User;

  totalAmount = 0.0;
  editEntryInOut = '-1';
  editEntry: Entry;
  editEntryItems: EntryItem[];
  editEntryDate: Date;
  editEntryPieceNo = 0;
  editEntryAddress: Address;
  editEntryErrors = false;

  addressList$: Observable<Address[]>;
  addressList: Address[];
  addressListFields = { text: 'name', value: 'id' };
  selectedAddressCategory: Category;

  categoryList: Category[];
  categoryList$: Observable<Category[]>;
  categoryListFields = { text: 'name', value: 'id' };

  constructor(
    private readonly entryService: EntryService,
    private readonly router: Router,
    private readonly drawerService: DrawerService,
    private readonly addressService: AddressService,
    private readonly categoryService: CategoryService,
    private readonly globalService: GlobalService,
    private readonly route: ActivatedRoute,
    private readonly datePipe: DatePipe,
    private readonly authenticationService: AuthenticationService
  ) {
    this.route.queryParams.subscribe((params) => {
      if (params && params.entryId) {
        const entryId = params.entryId;
        this.entryService.getEntry(entryId).subscribe((entry) => {
          this.editEntry = entry;
          this.editEntryItems = this.editEntry.entryitems;
          this.editEntryAddress = this.editEntry.address;
          this.totalAmount = this.editEntry.totalAmount;
          if (!this.totalAmount || this.totalAmount === 0) {
            this.recalculateNewEntryTotal();
          }
          const storedInOut = this.editEntry.inout === -1 ? 1 : 2;
          if (storedInOut) {
            this.selectedMode = storedInOut;
            this.editEntryInOut = storedInOut.toString();
          }

          this.editEntryPieceNo = this.editEntry.pieceNo;

          this.addressList$ = this.addressService.getAddresses(this.selectedMode === 1 ? '-1' : '1');
          this.addressList$.subscribe((addresses) => {
            this.addressList = addresses;
            this.editEntryAddress = addresses[0];
          });

          this.categoryList$ = this.categoryService.getCategories(this.selectedMode === 1 ? '-1' : '1');
          this.categoryList$.subscribe((categories) => {
            this.categoryList = categories;
          });
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

  onEditAddressChange(args: any) {
    const editAddress: Address = args.itemData;
    this.editEntryAddress = editAddress;
    if (editAddress && editAddress.category) {
      const addressCategory = editAddress.category;
      this.selectedAddressCategory = addressCategory;
      this.editEntryItems.map((item) => (addressCategory ? (item.category = addressCategory) : (item.category = this.categoryList[0])));
    }
  }

  onRemoveEditEntryItem(itemIndex: number) {
    const item = this.editEntryItems[itemIndex];
    this.editEntryItems.splice(itemIndex, 1);
    if (this.editEntryItems.length === 0) {
      this.onAddEntryItem();
    }

    this.recalculateNewEntryTotal();
  }

  onAddEntryItem() {
    this.editEntryItems.push({
      _id: '',
      amount: 0.0,
      description: '',
      category: this.selectedAddressCategory || this.categoryList[0]
    });

    setTimeout(() => {
      this.scrollable.scrollTo({ bottom: 0 });
    }, 100);
  }

  onChangeItemCategory(args: any, itemIndex: number) {
    const newCategory: Category = args.itemData;
    this.editEntryItems[itemIndex].category = newCategory;
  }

  onEditEntryItemAmountChange(argItem: any, args: any) {
    argItem.amount = args;
    this.recalculateNewEntryTotal();
  }

  onSaveEditEntry() {
    const validItems = this.editEntryItems.filter((item) => +item.amount > 0 && item.category);
    const itemsToUpdate: any[] = new Array<any>();
    if (validItems.length > 0 && this.editEntryAddress.id) {
      validItems.forEach((item) => {
        itemsToUpdate.push({
          amount: item.amount,
          category: item.category.id
        });
      });
      const entryToUpdate = {
        address: this.editEntryAddress.id,
        totalAmount: this.totalAmount,
        entryitems: itemsToUpdate,
        id: this.editEntry.id
      };
      this.entryService.updateEntry(entryToUpdate).subscribe(
        () => {
          this.onGoToLedger();
        },
        (error) => {
          if (error.status === 200) {
            this.onGoToLedger();
          } else {
            console.log(`Error: ${error.message || error.toString()}`);
          }
        }
      );
    } else {
      this.editEntryErrors = true;
      setTimeout(() => {
        this.editEntryErrors = false;
      }, 3000);
    }
  }

  onGoToLedger() {
    this.router.navigate(['../ledger'], { relativeTo: this.route });
  }

  private recalculateNewEntryTotal() {
    this.totalAmount = 0.0;

    this.editEntryItems.forEach((item) => {
      if (item.amount) {
        const itemAmount: string = item.amount.toString();
        this.totalAmount = this.totalAmount + parseFloat(itemAmount);
      }
    });
  }
}
