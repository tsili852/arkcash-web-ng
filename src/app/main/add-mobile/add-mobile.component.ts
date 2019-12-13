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
  templateUrl: './add-mobile.html',
  styleUrls: ['./add-mobile.scss']
})
export class AddMobileComponent implements OnInit {
  @ViewChild(NgScrollbar, { static: true }) scrollable: NgScrollbar;

  selectedMode = 1;

  connectedUser: User;
  logedinUser: User;

  totalAmount = 0.0;
  newEntryInOut = '-1';
  newEntryItems: {
    category: Category;
    amount: string;
  }[];
  newEntryDate: Date;
  newEntryPieceNo = 0;
  newEntryAddress: Address;
  newEntryErrors = false;

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
    this.newEntryDate = new Date();

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

    this.globalService.updateMenuItem(3);

    const storedInOut = localStorage.getItem('inout');
    if (storedInOut) {
      this.selectedMode = +storedInOut;
      this.newEntryInOut = storedInOut;
    }

    this.entryService.getPieceNo().subscribe((entryNumber) => {
      this.newEntryPieceNo = entryNumber.value + 1;
    });
  }

  ngOnInit(): void {
    this.fetchAddressesAndCategories();
  }

  fetchAddressesAndCategories() {
    this.addressList$ = this.addressService.getAddresses(this.selectedMode === 1 ? '-1' : '1');
    this.addressList$.subscribe((addresses) => {
      this.addressList = addresses;
      this.newEntryAddress = addresses[0];
    });

    this.categoryList$ = this.categoryService.getCategories(this.selectedMode === 1 ? '-1' : '1');
    this.categoryList$.subscribe((categories) => {
      this.categoryList = categories;
      this.newEntryItems = [
        {
          amount: '',
          category: this.categoryList[0]
        }
      ];
    });
  }

  onSelectMode(choice: number) {
    this.selectedMode = choice;
    if (choice === 1) {
      this.newEntryInOut = '-1';
    } else {
      this.newEntryInOut = '1';
    }
    this.fetchAddressesAndCategories();
  }

  onNewAddressChange(args: any) {
    const newAddress: Address = args.itemData;
    this.newEntryAddress = newAddress;
    if (newAddress && newAddress.category) {
      const addressCategory = newAddress.category;
      this.selectedAddressCategory = addressCategory;
      this.newEntryItems.map((item) => (addressCategory ? (item.category = addressCategory) : (item.category = this.categoryList[0])));
      // this.newEntryItems.forEach((item) => {
      //   item.category = addressCategory;
      // });
    }
  }

  onRemoveNewEntryItem(itemIndex: number) {
    const item = this.newEntryItems[itemIndex];
    this.newEntryItems.splice(itemIndex, 1);
    if (this.newEntryItems.length === 0) {
      this.onAddNewEntryItem();
    }

    this.recalculateNewEntryTotal();
  }

  onAddNewEntryItem() {
    this.newEntryItems.push({
      amount: '',
      category: this.selectedAddressCategory || this.categoryList[0]
    });

    setTimeout(() => {
      this.scrollable.scrollTo({ bottom: 0 });
    }, 100);
  }

  onChangeItemCategory(args: any, itemIndex: number) {
    const newCategory: Category = args.itemData;
    this.newEntryItems[itemIndex].category = newCategory;
  }

  onNewEntryItemAmountChange(argItem, args) {
    argItem.amount = args;
    this.recalculateNewEntryTotal();
  }

  onSaveNewEntry() {
    const validItems = this.newEntryItems.filter((item) => +item.amount > 0 && item.category);
    const itemsToUpdate: any[] = new Array<any>();
    if (validItems.length > 0 && this.newEntryAddress.id && this.newEntryDate) {
      validItems.forEach((item) => {
        itemsToUpdate.push({
          amount: item.amount,
          category: item.category.id
        });
      });
      this.drawerService.getDrawerByClient().subscribe((drawer) => {
        const newEntry = {
          pieceNo: this.newEntryPieceNo,
          client: this.connectedUser.id,
          drawer: drawer[0].id,
          address: this.newEntryAddress.id,
          exported: false,
          entryDate: this.datePipe.transform(this.newEntryDate, 'yyyy-MM-ddThh:mm:ss'),
          inout: this.selectedMode === 1 ? '-1' : '1',
          totalAmount: this.totalAmount,
          entryitems: itemsToUpdate,
          id: ''
        };
        this.entryService.addNewEntry(newEntry).subscribe(
          () => {
            this.onGoToLedger();
          },
          (error) => {
            console.log(`Error: ${error}`);
          }
        );
      });
    } else {
      this.newEntryErrors = true;
      setTimeout(() => {
        this.newEntryErrors = false;
      }, 3000);
    }
  }

  onGoToLedger() {
    this.router.navigate(['../ledger'], { relativeTo: this.route });
  }

  private recalculateNewEntryTotal() {
    this.totalAmount = 0.0;

    this.newEntryItems.forEach((item) => {
      if (item.amount) {
        const itemAmount: string = item.amount.toString();
        this.totalAmount = this.totalAmount + parseFloat(itemAmount);
      }
    });
  }
}
