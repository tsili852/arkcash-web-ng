import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { User, AuthenticationService } from '../../shared/authentication';
import { GlobalService } from '../../shared/global.service';
import { Address, AddressService } from '../../shared/address';
import { Category, CategoryService } from '../../shared/category';
import { L10n, setCulture } from '@syncfusion/ej2-base';
import { GridComponent, SelectionSettingsModel } from '@syncfusion/ej2-angular-grids';
import { AddressSearchPipe, CategorySearchPipe } from '../../utils/pipes';

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
  searchTextAddresses = '';
  searchTextCategories = '';
  addresses$: Observable<Address[]>;
  initialAddressesList: Address[];
  addressesList: Address[];
  categories$: Observable<Category[]>;
  categoriesList: Category[];
  initialCategoriesList: Category[];
  addressesCount = 0;
  categoriesCount = 0;

  showEditModal = false;
  editAddressErrors = false;
  usedAddresses: string[];
  deleteOldAddressConfirm = false;
  selectedEditAddress: Address;
  addressListFields = { text: 'name', value: 'id' };
  selectedEditAddressCategory: Category;
  categoryListFields = { text: 'name', value: 'id' };

  showAddModal = false;
  newAddress: Address;
  addAddressErrors = false;
  addAddressInout = -1;

  selectionOptions: SelectionSettingsModel;

  showEditCategoryModal = false;
  showAddCategoryModal = false;

  usedCategories: string[];

  selectedEditCategory: Category;
  editCategoryError = false;
  deleteOldCategoryConfirm = false;

  newCategory: Category;
  addCategoryError = false;

  constructor(
    private readonly globalService: GlobalService,
    private readonly addressService: AddressService,
    private readonly categoryService: CategoryService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly authenticationService: AuthenticationService,
    private readonly addressPipe: AddressSearchPipe,
    private readonly categoryPipe: CategorySearchPipe
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

    this.categoryService.getAllUsedCategories().subscribe((categories) => {
      this.usedCategories = categories;
    });
  }

  ngOnInit(): void {
    this.fetchAddresses();
  }

  fetchAddresses() {
    this.addresses$ = this.addressService.getAddresses(this.selectedInOut.toString());
    this.addresses$.subscribe((addresses) => {
      this.addressesCount = addresses.length;
      this.addressesList = addresses;
      this.initialAddressesList = addresses;
    });
    this.categories$ = this.categoryService.getCategories(this.selectedInOut.toString());
    this.categories$.subscribe((categories) => {
      this.categoriesList = categories;
      this.initialCategoriesList = categories;
      this.categoriesCount = categories.length;
    });
  }

  onSelectMode(mode: number) {
    this.selectedMode = mode;
    this.searchTextAddresses = '';
    this.searchTextCategories = '';
    if (mode === 1 || mode === 3) {
      this.selectedInOut = -1;
    } else {
      this.selectedInOut = 1;
    }
    this.addAddressInout = mode;
    this.fetchAddresses();
  }

  searchTextChange(changedText: string) {
    this.addressesList = this.initialAddressesList;
    this.addressesList = this.addressPipe.transform(this.addressesList, changedText);
  }

  searchCategoryTextChange(changedText: string) {
    this.categoriesList = this.initialCategoriesList;
    this.categoriesList = this.categoryPipe.transform(this.categoriesList, changedText);
  }

  rowDataBound(args: any) {
    const address: Address = args.data;
    if (address.inout === -1) {
      args.row.classList.add('bg-green-100');
    } else {
      args.row.classList.add('bg-red-100');
    }
  }

  rowDataBoundCategory(args: any) {
    const category: Category = args.data;
    if (category.inout === -1) {
      args.row.classList.add('bg-green-100');
    } else {
      args.row.classList.add('bg-red-100');
    }
  }

  onRowClick(address: Address) {
    this.showEditModal = true;
    this.selectedEditAddress = {
      id: address.id,
      name: address.name,
      accNo: address.accNo,
      category: address.category,
      client: address.client,
      inout: address.inout,
      createdAt: address.createdAt,
      updateAt: address.updateAt
    };
    this.selectedEditAddressCategory = {
      accNo: address.category.accNo,
      client: address.category.client,
      createdAt: null,
      id: address.category.id,
      inout: address.category.inout,
      name: address.category.name,
      updatedAt: null
    };
    this.deleteOldAddressConfirm = false;
  }

  onRowClickCategory(category: Category) {
    this.showEditCategoryModal = true;
    this.selectedEditCategory = {
      accNo: category.accNo,
      client: category.client,
      createdAt: null,
      id: category.id,
      inout: category.inout,
      name: category.name,
      updatedAt: null
    };
    this.deleteOldCategoryConfirm = false;
  }

  onEditChangeAddressCategory(args: any) {
    const selectedCategory = args.itemData;
    if (selectedCategory) {
      this.selectedEditAddressCategory = selectedCategory;
    }
  }

  canAddressesBeDeleted() {
    return this.usedAddresses.includes(this.selectedEditAddress.id) ? false : true;
  }

  canCategoryBeDeleted() {
    return this.usedCategories.includes(this.selectedEditCategory.id) ? false : true;
  }

  onSaveEditAddress() {
    if (this.selectedEditAddress.name.trim().length > 0) {
      const addressToUpdate = {
        category: this.selectedEditAddressCategory.id,
        name: this.selectedEditAddress.name,
        id: this.selectedEditAddress.id,
        updateAt: new Date()
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
      this.showAddModal = false;
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

  onSaveEditCategory() {
    if (this.selectedEditCategory.name.trim().length > 0) {
      this.showEditCategoryModal = false;
      const categoryToUpdate = {
        name: this.selectedEditCategory.name,
        accNo: this.selectedEditCategory.accNo,
        id: this.selectedEditCategory.id,
        updateAt: new Date()
      };

      this.categoryService.updateCategory(categoryToUpdate).subscribe(
        () => {
          setTimeout(() => {
            this.fetchAddresses();
          }, 100);
        },
        (error) => {
          console.log(`Error: ${JSON.stringify(error, null, 2)}`);
        }
      );
    } else {
      this.editCategoryError = true;
      setTimeout(() => {
        this.editCategoryError = false;
      }, 3000);
    }
  }

  onDeleteCategory() {
    this.deleteOldCategoryConfirm = true;
  }

  onDeleteCategoryConfirmed() {
    this.categoryService.deleteCategory(this.selectedEditCategory).subscribe(
      () => {
        this.showEditCategoryModal = false;
        setTimeout(() => {
          this.fetchAddresses();
        }, 100);
      },
      (error) => {
        console.log(`Error: ${JSON.stringify(error, null, 2)}`);
      }
    );
  }

  onAddNewCategory() {
    this.newCategory = {
      accNo: '',
      client: this.globalService.getSelectedUser().id,
      createdAt: new Date(),
      id: '',
      inout: this.addAddressInout,
      name: '',
      updatedAt: null
    };
    this.showAddCategoryModal = true;
  }

  onSaveAddCategory() {
    if (this.newCategory.name.trim().length > 0) {
      this.showAddCategoryModal = false;
      const categoryToInsert = {
        name: this.newCategory.name,
        accNo: this.newCategory.accNo,
        client: this.newCategory.client,
        inout: this.addAddressInout,
        createdAt: new Date()
      };

      this.categoryService.addNewCategory(categoryToInsert).subscribe(
        (returnAddress) => {
          setTimeout(() => {
            this.fetchAddresses();
          }, 100);
        },
        (error) => {
          console.log(`Error: ${JSON.stringify(error, null, 2)}`);
        }
      );
    } else {
      this.addCategoryError = true;
      setTimeout(() => {
        this.addCategoryError = false;
      }, 3000);
    }
  }
}
