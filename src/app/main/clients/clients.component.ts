import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { L10n, setCulture } from '@syncfusion/ej2-base';
import { GridComponent, SelectionSettingsModel } from '@syncfusion/ej2-angular-grids';

import { AuthenticationService, User } from '../../shared/authentication';
import { GlobalService } from '../../shared/global.service';
import { EntryService } from '../../shared/entry';
import { DrawerService } from '../../shared/drawer';
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
  templateUrl: './clients.html',
  styleUrls: ['./clients.scss']
})
export class ClientsComponent implements OnInit {
  @ViewChild('grid', { static: false }) public grid: GridComponent;
  selectionOptions: SelectionSettingsModel;

  connectedUser: User;
  searchText = '';

  users$: Observable<User[]>;
  usersList: User[];
  totalUsers = 0;

  clientsTotal: {
    _id: string;
    total: number;
  }[];

  showAddModal = false;
  showAddModalMobile = false;
  usersListFields = { text: 'name', value: 'id' };
  userToCopyCategories: User;
  categoriesToCopy: Category[];
  newUser: User;
  addUserError = false;
  addUserStartDate: Date;
  newDateMinimum: Date = new Date();

  showEditModal = false;
  showEditModalMobile = false;
  editUser: User;
  editUserError = false;
  deleteUserConfirm = false;

  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly globalService: GlobalService,
    private readonly entryService: EntryService,
    private readonly drawerService: DrawerService,
    private readonly categoryService: CategoryService
  ) {
    this.selectionOptions = { checkboxOnly: true };
    this.globalService.updateMenuItem(0);

    this.connectedUser = this.authenticationService.getCurrentUser();

    this.entryService.getEntriesTotalAll().subscribe((entriesTotal) => {
      this.clientsTotal = entriesTotal;
    });
  }

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers() {
    this.users$ = this.authenticationService.getAllUsers(false);
    this.users$.subscribe((users) => {
      this.usersList = users;
    });
  }

  getUserTotal(userId: string): number {
    if (this.clientsTotal) {
      const clientTotal = this.clientsTotal.find((total) => total._id === userId);
      if (clientTotal) {
        return clientTotal.total;
      } else {
        return 0;
      }
    }
  }

  onRowClick(user: User) {
    this.globalService.setSelectedUser(user);
    this.router.navigate(['../ledger'], { relativeTo: this.route });
  }

  onAdd() {
    this.newUser = {
      accNo: null,
      id: '',
      isActive: true,
      isAdmin: false,
      lastExport: null,
      lastLoginOn: null,
      name: '',
      password: '',
      slug: '',
      startDate: '',
      username: '',
      email: '',
      phone: ''
    };
    this.addUserStartDate = new Date();
    this.userToCopyCategories = this.usersList[0];
    this.showAddModal = true;
  }

  onAddMobile() {
    this.newUser = {
      accNo: null,
      id: '',
      isActive: true,
      isAdmin: false,
      lastExport: null,
      lastLoginOn: null,
      name: '',
      password: '',
      slug: '',
      startDate: '',
      username: '',
      email: '',
      phone: ''
    };
    this.addUserStartDate = new Date();
    this.userToCopyCategories = this.usersList[0];
    this.showAddModalMobile = true;
  }

  onChangeClientToCopy(args: any) {
    this.userToCopyCategories = args.itemData;
    this.categoryService.getClientCategories(this.userToCopyCategories.id).subscribe((categories) => {
      this.categoriesToCopy = categories;
    });
  }

  onSaveNewUser() {
    if (this.newUser.name.trim().length > 0 && this.newUser.username.trim().length > 0 && this.newUser.password.trim().length > 0) {
      const userToCreate = {
        name: this.newUser.name,
        username: this.newUser.username,
        password: this.newUser.password,
        phone: this.newUser.phone,
        email: this.newUser.email,
        startDate: this.addUserStartDate.toISOString(),
        accNo: this.newUser.accNo
      };

      this.authenticationService.createUser(userToCreate).subscribe(
        (user) => {
          if (user) {
            const drawerToCreate = {
              client: user.id,
              name: `${user.name}-caisse`
            };

            this.drawerService.createDrawer(drawerToCreate).subscribe(
              () => {
                this.categoriesToCopy.map((category) => (category.client = user.id));
                this.categoryService.addCategories(this.categoriesToCopy);

                if (this.showAddModal) {
                  this.showAddModal = false;
                } else {
                  this.showAddModalMobile = false;
                }
                this.fetchUsers();
              },
              (error) => {
                console.log(`Error: ${error.message || error.toString()}`);
              }
            );
          }
        },
        (error) => {
          console.log(`Error: ${error.message || error.toString()}`);
        }
      );
    } else {
      this.addUserError = true;
      setTimeout(() => {
        this.addUserError = false;
      }, 5000);
    }
  }

  onEdit(user: User) {
    this.editUser = user;
    this.editUser.password = '';
    this.deleteUserConfirm = false;
    this.showEditModal = true;
  }

  onEditMobile(user: User) {
    this.editUser = user;
    this.editUser.password = '';
    this.deleteUserConfirm = false;
    this.showEditModalMobile = true;
  }

  onSaveEditUser() {
    if (this.editUser.name.trim().length > 0 && this.editUser.username.trim().length > 0 && this.editUser.password.trim().length > 0) {
      const userToUpdate: any = {
        name: this.editUser.name,
        username: this.editUser.username,
        phone: this.editUser.phone,
        email: this.editUser.email,
        id: this.editUser.id
      };

      if (this.editUser.password && this.editUser.password.trim().length > 0) {
        userToUpdate.password = this.editUser.password;
      }

      this.authenticationService.updateUser(userToUpdate).subscribe(
        () => {
          if (this.showEditModal) {
            this.showEditModal = false;
          } else {
            this.showEditModalMobile = false;
          }
          this.fetchUsers();
        },
        (error) => {
          console.log(`Error: ${error.message || error.toString()}`);
        }
      );
    } else {
      this.addUserError = true;
      setTimeout(() => {
        this.addUserError = false;
      }, 5000);
    }
  }

  onDeleteUser() {
    this.deleteUserConfirm = true;
  }

  onDeleteConfirmed() {
    this.authenticationService.deleteUser(this.editUser.id).subscribe(() => {
      if (this.showEditModal) {
        this.showEditModal = false;
      } else {
        this.showEditModalMobile = false;
      }
      this.fetchUsers();
    });
  }
}
