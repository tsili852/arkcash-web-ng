import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';

import { AuthenticationService, User } from '../../shared/authentication';
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
  selectedMode = -1;
  searchText = '';
  addresses$: Observable<Address[]>;
  categories$: Observable<Category[]>;
  addressesCount = 0;
  showEditModal = false;
  editAddressErrors = false;
  usedAddresses: string[];

  deleteOldAddressConfirm = false;

  selectedEditAddress: Address;
  addressListFields = { text: 'name', value: 'id' };

  selectedEditCategory: Category;
  categoryListFields = { text: 'name', value: 'id' };

  selectionOptions: SelectionSettingsModel;

  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly addressService: AddressService,
    private readonly categoryService: CategoryService
  ) {
    this.connectedUser = this.authenticationService.getCurrentUser();

    this.selectionOptions = { checkboxOnly: true };

    this.addressService.getAllUsedAddresses().subscribe((addresses) => {
      this.usedAddresses = addresses;
    });
  }

  ngOnInit(): void {
    this.fetchAddresses();
  }

  fetchAddresses() {
    this.addresses$ = this.addressService.getAddresses(this.selectedMode.toString());
    this.addresses$.subscribe((addresses) => {
      this.addressesCount = addresses.length;
    });
    this.categories$ = this.categoryService.getCategories(this.selectedMode.toString());
  }

  onShowAddModal() {}

  onSelectMode(mode: number) {
    this.selectedMode = mode;
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
  }

  onEditChangeAddressCategory(args: any) {
    const selectedCategory = args.itemData;
    this.selectedEditAddress.category = selectedCategory;
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

  onDeleteConfirmed() {}
}
