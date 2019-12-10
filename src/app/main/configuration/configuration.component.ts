import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { User, AuthenticationService } from '../../shared/authentication';
import { GlobalService } from '../../shared/global.service';
import { Address, AddressService } from '../../shared/address';
import { Category, CategoryService } from '../../shared/category';
import { L10n, setCulture } from '@syncfusion/ej2-base';
import { GridComponent, SelectionSettingsModel } from '@syncfusion/ej2-angular-grids';

setCulture('fr-CH');

L10n.load({
  'fr-CH': {
    grid: {
      EmptyRecord: 'Rien à afficher'
    }
  }
});

@Component({
  templateUrl: './configuration.html',
  styleUrls: ['./configuration.scss']
})
export class ConfigurationComponent implements OnInit {
  @ViewChild('grid', { static: false }) public grid: GridComponent;

  connectedUser: User;
  logedinUser: User;

  selectedMode = 1;
  selectedInOut = -1;
  searchText = '';
  addresses$: Observable<Address[]>;
  categories$: Observable<Category[]>;
  categoriesList: Category[];
  addressesCount = 0;

  showEditModal = false;
  editAddressErrors = false;
  usedAddresses: string[];
  deleteOldAddressConfirm = false;
  selectedEditAddress: Address;
  addressListFields = { text: 'name', value: 'id' };
  selectedEditCategory: Category;
  categoryListFields = { text: 'name', value: 'id' };

  showAddModal = false;
  newAddress: Address;
  addAddressErrors = false;
  addAddressInout = -1;

  selectionOptions: SelectionSettingsModel;

  constructor(
    private readonly globalService: GlobalService,
    private readonly addressService: AddressService,
    private readonly categoryService: CategoryService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly authenticationService: AuthenticationService
  ) {
    this.connectedUser = this.globalService.getSelectedUser();
    this.logedinUser = this.authenticationService.getCurrentUser();

    this.globalService.updateMenuItem(2);

    if (this.logedinUser.isAdmin) {
      if (!this.connectedUser) {
        this.router.navigate(['../clients'], { relativeTo: this.route });
      }
    } else {
      this.connectedUser = this.authenticationService.getCurrentUser();
      this.globalService.setSelectedUser(this.connectedUser);
    }

    this.selectionOptions = { checkboxOnly: true };

    this.addressService.getAllUsedAddresses().subscribe((addresses) => {
      this.usedAddresses = addresses;
    });
  }

  ngOnInit(): void {
    this.fetchAddresses();
  }

  fetchAddresses() {
    this.addresses$ = this.addressService.getAddresses(this.selectedInOut.toString());
    this.addresses$.subscribe((addresses) => {
      this.addressesCount = addresses.length;
    });
    this.categories$ = this.categoryService.getCategories(this.selectedInOut.toString());
    this.categories$.subscribe((categories) => {
      this.categoriesList = categories;
    });
  }

  onSelectMode(mode: number) {
    this.selectedMode = mode;
    if (mode === 1 || mode === 3) {
      this.selectedInOut = -1;
    } else {
      this.selectedInOut = 1;
    }
    this.addAddressInout = mode;
    this.fetchAddresses();
  }

  rowDataBound(args: any) {
    const address: Address = args.data;
    if (address.inout === -1) {
      args.row.classList.add('bg-green-100');
    } else {
      args.row.classList.add('bg-red-100');
    }
  }

  onRowClick(address: Address) {
    this.showEditModal = true;
    this.selectedEditAddress = address;
    this.selectedEditCategory = address.category;
    this.deleteOldAddressConfirm = false;
  }

  onEditChangeAddressCategory(args: any) {
    const selectedCategory = args.itemData;
    if (selectedCategory) {
      this.selectedEditAddress.category = selectedCategory;
    }
  }

  canAddressesBeDeleted() {
    return this.usedAddresses.includes(this.selectedEditAddress.id) ? false : true;
  }

  onSaveEditAddress() {
    if (this.selectedEditAddress.name.trim().length > 0) {
      const addressToUpdate = {
        category: this.selectedEditAddress.category.id,
        name: this.selectedEditAddress.name,
        id: this.selectedEditAddress.id
      };

      this.addressService.updateAddress(addressToUpdate).subscribe(
        (returnAddress) => {
          console.log(returnAddress);
          this.showEditModal = false;
          setTimeout(() => {
            this.fetchAddresses();
          }, 100);
        },
        (error) => {
          console.log(`Error: ${JSON.stringify(error, null, 2)}`);
        }
      );
    } else {
      this.editAddressErrors = true;
      setTimeout(() => {
        this.editAddressErrors = false;
      }, 3000);
    }
  }

  onDeleteAddress() {
    this.deleteOldAddressConfirm = true;
  }

  onDeleteConfirmed() {
    this.addressService.deleteAddress(this.selectedEditAddress).subscribe(
      () => {
        this.showEditModal = false;
        setTimeout(() => {
          this.fetchAddresses();
        }, 100);
      },
      (error) => {
        console.log(`Error: ${JSON.stringify(error, null, 2)}`);
      }
    );
  }

  onAddNewAddress() {
    this.newAddress = {
      id: '',
      accNo: 1000,
      category: this.categoriesList[0],
      client: this.globalService.getSelectedUser().id,
      name: '',
      inout: this.addAddressInout,
      createdAt: new Date(),
      updateAt: null
    };
    this.showAddModal = true;
  }

  onSaveAddAddress() {
    if (this.newAddress.name.trim().length > 0) {
      const addressToInsert = {
        category: this.newAddress.category.id,
        name: this.newAddress.name,
        accNo: 1000,
        client: this.newAddress.client,
        inout: this.addAddressInout,
        createdAt: new Date()
      };

      this.addressService.addNewAddress(addressToInsert).subscribe(
        (returnAddress) => {
          console.log(returnAddress);
          this.showAddModal = false;
          setTimeout(() => {
            this.fetchAddresses();
          }, 100);
        },
        (error) => {
          console.log(`Error: ${JSON.stringify(error, null, 2)}`);
        }
      );
    } else {
      this.addAddressErrors = true;
      setTimeout(() => {
        this.addAddressErrors = false;
      }, 3000);
    }
  }
}
