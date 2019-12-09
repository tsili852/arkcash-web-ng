import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { L10n, setCulture } from '@syncfusion/ej2-base';
import { GridComponent, SelectionSettingsModel, parentsUntil } from '@syncfusion/ej2-angular-grids';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

import { environment } from '../../../environments/environment';
import { Entry, EntryItem, EntryService } from '../../shared/entry';
import { SearchTerms } from '../../shared/search-terms/search-terms';
import { AuthenticationService, User } from '../../shared/authentication';
import { Utilities } from '../../utils/utilities';
import { Drawer, DrawerService } from '../../shared/drawer';
import { Address, AddressService } from '../../shared/address';
import { Category, CategoryService } from '../../shared/category';

setCulture('fr-CH');

L10n.load({
  'fr-CH': {
    grid: {
      EmptyRecord: 'Rien à afficher'
    }
  }
});

@Component({
  selector: 'app-ledger',
  templateUrl: './ledger.html',
  styleUrls: ['./ledger.scss']
})
export class LedgerComponent implements OnInit {
  @ViewChild('grid', { static: false }) public grid: GridComponent;

  connectedUser: User;

  searchText = '';
  selectedFilter = 0;

  entries: Observable<Entry[]>;
  entriesObj: Entry[];
  entriesTotal: Observable<number>;
  totalEntries: Observable<any>;
  skipEntries = 0;
  amountEntries = 9999;
  totalAmount: Observable<any>;

  inoutParameter = '';
  initialDateFrom: Date;
  searchTerms: SearchTerms;
  exporteesChecked = false;
  isTest = false;

  entriesCount = 0;

  connectedClientId = '';

  sortOptions: any;

  showSearchModal = false;

  showAddModal = false;
  showEditModal = false;

  addressList$: Observable<Address[]>;
  addressList: Address[];
  addressListFields = { text: 'name', value: 'id' };
  selectedAddressCategory: Category;

  categoryList: Category[];
  categoryList$: Observable<Category[]>;
  categoryListFields = { text: 'name', value: 'id' };

  newEntryDate: Date;
  newEntryInOut = 1;
  newEntryItems: {
    category: Category;
    amount: string;
  }[];
  newEntryItemsTotal = 0;
  newEntryPieceNo = 0;
  newEntryAddress: Address;
  newEntryErrors = false;
  selectionOptions: SelectionSettingsModel;

  editEntryErrors = false;
  editEntryInOut = 1;
  selectedEditEntry: Entry;
  editEntryAddress: Address;
  editEntryItemsTotal = 0;
  editEntryDate: Date;
  editEntryItems: Array<{
    category: Category;
    amount: string;
  }>;
  selectedEditAddressCategory: Category;

  deleteOldEntryConfirm = false;

  constructor(
    private readonly entryService: EntryService,
    private readonly router: Router,
    private readonly authenticationService: AuthenticationService,
    private readonly zone: NgZone,
    private readonly drawerService: DrawerService,
    private readonly addressService: AddressService,
    private readonly categoryService: CategoryService,
    private readonly datePipe: DatePipe
  ) {
    this.selectionOptions = { checkboxOnly: true };

    this.connectedUser = this.authenticationService.getCurrentUser();

    if (!environment.production) {
      this.isTest = true;
    }

    this.connectedClientId = this.authenticationService.getClientId();

    if (!this.authenticationService.getLastExportDate()) {
      this.initialDateFrom = Utilities.addDays(new Date(), 1);
    } else {
      this.initialDateFrom = Utilities.addDays(this.authenticationService.getLastExportDate(), 1);
    }

    this.searchTerms = new SearchTerms(null, new Date(), 0, 0, '', this.exporteesChecked);

    const storedInOut = localStorage.getItem('inout');
    if (storedInOut) {
      this.selectedFilter = +storedInOut;
      this.inoutParameter = storedInOut;
    }
  }

  ngOnInit(): void {
    this.fetchEntries();
  }

  fetchEntries() {
    this.entries = this.entryService.getEntries(
      this.skipEntries,
      this.amountEntries,
      this.inoutParameter,
      this.searchTerms,
      this.connectedClientId
    );

    this.entries.subscribe((entries: Entry[]) => {
      this.entriesObj = entries;
      this.entriesCount = entries.length;
    });

    this.entriesTotal = this.entryService.getEntriesTotal();
  }

  onChooseFilter(selection: number) {
    this.selectedFilter = selection;
    switch (selection) {
      case 0: {
        this.inoutParameter = '';
        break;
      }
      case 1: {
        this.inoutParameter = '-1';
        break;
      }
      case 2: {
        this.inoutParameter = '1';
        break;
      }
    }

    this.fetchEntries();
  }

  onExporteesFilter() {
    this.searchTerms.exportees = this.exporteesChecked;
    // this.zone.run(() => {
    if (this.exporteesChecked) {
      // tslint:disable-next-line: no-string-literal
      this.grid.columns[7]['visible'] = true;
    } else {
      // tslint:disable-next-line: no-string-literal
      this.grid.columns[7]['visible'] = false;
    }
    this.grid.refreshColumns();
    // });
    this.fetchEntries();
  }

  rowDataBound(args: any) {
    const entry: Entry = args.data;
    if (entry.inout === -1) {
      args.row.classList.add('bg-green-100');
    } else {
      args.row.classList.add('bg-red-100');
    }
  }

  onShowSearchModal() {
    this.showSearchModal = true;
  }

  onApplySearch() {
    this.searchTerms.exportees = this.exporteesChecked;
    this.showSearchModal = false;
    this.fetchEntries();
  }

  onResetFilters() {
    this.searchText = '';
    this.searchTerms = {
      amountFrom: 0,
      amountTo: 0,
      dateFrom: null,
      dateTo: new Date(),
      exportees: false,
      text: ''
    };

    this.fetchEntries();
  }

  changeDateFrom(args: MatDatepickerInputEvent<Date>) {
    const dateFrom = args.value;
    this.searchTerms.dateFrom = dateFrom;
    this.fetchEntries();
  }

  changeDateTo(args: MatDatepickerInputEvent<Date>) {
    const dateTo = args.value;
    this.searchTerms.dateTo = dateTo;
    this.fetchEntries();
  }

  onDataBound(args: any) {
    console.log(args);
  }

  getEntryInOutText(entry: Entry) {
    if (entry.inout === -1) {
      return 'Entrée';
    } else {
      return 'Sortie';
    }
  }

  onShowAddModal() {
    this.showAddModal = true;
    this.entryService.getPieceNo().subscribe((entryNumber) => {
      this.newEntryPieceNo = entryNumber.value + 1;
    });

    this.addressList$ = this.addressService.getAddresses(this.newEntryInOut === 1 ? '-1' : '1');
    this.addressList$.subscribe((addresses) => {
      this.addressList = addresses;
      this.newEntryAddress = addresses[0];
    });

    this.categoryList$ = this.categoryService.getCategories(this.newEntryInOut === 1 ? '-1' : '1');
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

  onChangeNewEntryInOut(inOut: number) {
    this.newEntryInOut = inOut;
    this.addressList$ = this.addressService.getAddresses(this.newEntryInOut === 1 ? '-1' : '1');
    this.addressList$.subscribe((addresses) => {
      this.addressList = addresses;
      this.newEntryAddress = addresses[0];
    });

    this.categoryList$ = this.categoryService.getCategories(this.newEntryInOut === 1 ? '-1' : '1');
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

  onNewCategoryChange(args: any) {
    const newCategory: Category = args.itemData;
    console.log(`Category: ${newCategory.name}`);
  }

  onChangeItemCategory(args: any, itemIndex: number) {
    const newCategory: Category = args.itemData;
    this.newEntryItems[itemIndex].category = newCategory;
  }

  onRemoveNewEntryItem(itemIndex: number) {
    const item = this.newEntryItems[itemIndex];
    this.newEntryItemsTotal -= +item.amount;
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
  }

  onNewEntryItemAmountChange(argItem, args) {
    argItem.amount = args;
    this.recalculateNewEntryTotal();
  }

  private recalculateNewEntryTotal() {
    this.newEntryItemsTotal = 0.0;

    this.newEntryItems.forEach((item) => {
      if (item.amount) {
        const itemAmount: string = item.amount.toString();
        this.newEntryItemsTotal = this.newEntryItemsTotal + parseFloat(itemAmount);
      }
    });
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
          client: this.authenticationService.getClientId(),
          drawer: drawer[0].id,
          address: this.newEntryAddress.id,
          exported: false,
          entryDate: this.datePipe.transform(this.newEntryDate, 'yyyy-MM-ddThh:mm:ss'),
          inout: this.newEntryInOut === 1 ? '-1' : '1',
          totalAmount: this.newEntryItemsTotal,
          entryitems: itemsToUpdate,
          id: ''
        };

        this.entryService.addNewEntry(newEntry).subscribe(
          () => {
            this.showAddModal = false;
            setTimeout(() => {
              this.fetchEntries();
            }, 100);
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

  onRowClick(argEntry: Entry) {
    if (argEntry) {
      this.selectedEditEntry = argEntry;
      this.editEntryInOut = this.selectedEditEntry.inout;
      this.editEntryDate = this.selectedEditEntry.entryDate;

      this.addressList$ = this.addressService.getAddresses(this.selectedEditEntry.inout.toString());
      this.addressList$.subscribe((addresses) => {
        this.addressList = addresses;
        this.editEntryAddress = addresses[0];
      });

      this.editEntryItems = new Array<{
        amount: string;
        category: Category;
      }>();

      this.categoryList$ = this.categoryService.getCategories(this.selectedEditEntry.inout.toString());
      this.categoryList$.subscribe((categories) => {
        this.categoryList = categories;
        this.selectedEditEntry.entryitems.forEach((item) => {
          this.editEntryItems.push({
            amount: item.amount.toString(),
            category: item.category
          });
        });
        this.recalculateEditEntryTotal();
        // this.editEntryItems = [
        //   {
        //     amount: '',
        //     category: this.categoryList[0]
        //   }
        // ];
      });

      this.showEditModal = true;
    }
  }

  onEditAddressChange(args: any) {
    const newAddress: Address = args.itemData;
    this.editEntryAddress = newAddress;
    if (newAddress && newAddress.category) {
      const addressCategory = newAddress.category;
      this.selectedEditAddressCategory = addressCategory;
      this.editEntryItems.map((item) => (addressCategory ? (item.category = addressCategory) : (item.category = this.categoryList[0])));
    }
  }

  onChangeEditEntryInOut(inOut: number) {
    this.editEntryInOut = inOut;
    this.addressList$ = this.addressService.getAddresses(this.newEntryInOut === 1 ? '-1' : '1');
    this.addressList$.subscribe((addresses) => {
      this.addressList = addresses;
      this.editEntryAddress = addresses[0];
    });

    this.categoryList$ = this.categoryService.getCategories(this.newEntryInOut === 1 ? '-1' : '1');
    this.categoryList$.subscribe((categories) => {
      this.categoryList = categories;
      this.editEntryItems = [
        {
          amount: '',
          category: this.categoryList[0]
        }
      ];
    });
  }

  onEditChangeItemCategory(args: any, itemIndex: number) {
    const newCategory: Category = args.itemData;
    this.editEntryItems[itemIndex].category = newCategory;
  }

  onEditEntryItemAmountChange(argItem, args) {
    argItem.amount = args;
    this.recalculateEditEntryTotal();
  }

  private recalculateEditEntryTotal() {
    this.editEntryItemsTotal = 0.0;

    this.editEntryItems.forEach((item) => {
      if (item.amount) {
        const itemAmount: string = item.amount.toString();
        this.editEntryItemsTotal = this.editEntryItemsTotal + parseFloat(itemAmount);
      }
    });
  }

  onRemoveEditEntryItem(itemIndex: number) {
    const item = this.editEntryItems[itemIndex];
    this.editEntryItems.splice(itemIndex, 1);
    if (this.editEntryItems.length === 0) {
      this.onAddEditEntryItem();
    }

    this.recalculateEditEntryTotal();
  }

  onAddEditEntryItem() {
    this.editEntryItems.push({
      amount: '',
      category: this.selectedEditAddressCategory || this.categoryList[0]
    });
  }

  onSaveEditEntry() {
    const validItems = this.editEntryItems.filter((item) => +item.amount > 0 && item.category);
    const itemsToUpdate: any[] = new Array<any>();
    if (validItems.length > 0 && this.editEntryAddress.id && this.editEntryDate) {
      validItems.forEach((item) => {
        itemsToUpdate.push({
          amount: item.amount,
          category: item.category.id
        });
      });
      const newEntry = {
        address: this.editEntryAddress.id,
        entryDate: this.datePipe.transform(this.editEntryDate, 'yyyy-MM-ddThh:mm:ss'),
        totalAmount: this.newEntryItemsTotal,
        entryitems: itemsToUpdate,
        id: this.selectedEditEntry.id
      };
      this.entryService.updateEntry(newEntry).subscribe(
        () => {
          this.showEditModal = false;
          setTimeout(() => {
            this.fetchEntries();
          }, 100);
        },
        (error) => {
          console.log(`Error: ${error}`);
        }
      );
    } else {
      this.editEntryErrors = true;
      setTimeout(() => {
        this.editEntryErrors = false;
      }, 3000);
    }
  }

  onDeleteEntry() {
    this.deleteOldEntryConfirm = true;
  }

  onDeleteConfirmed() {
    this.entryService.deleteEntry(this.selectedEditEntry).subscribe(
      () => {
        this.showEditModal = false;
        setTimeout(() => {
          this.fetchEntries();
        }, 100);
      },
      (error) => {
        console.log(`Error: ${error}`);
      }
    );
  }
}
