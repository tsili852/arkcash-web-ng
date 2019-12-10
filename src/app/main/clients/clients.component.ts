import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Observable } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { L10n, setCulture } from '@syncfusion/ej2-base';
import { GridComponent, SelectionSettingsModel, parentsUntil } from '@syncfusion/ej2-angular-grids';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

import { environment } from '../../../environments/environment';
import { AuthenticationService, User } from '../../shared/authentication';
import { GlobalService } from '../../shared/global.service';
import { Utilities } from '../../utils/utilities';

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

  showAddModal = false;
  showEditModal = false;

  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly router: Router,
    private readonly zone: NgZone,
    private readonly route: ActivatedRoute,
    private readonly globalService: GlobalService
  ) {
    this.selectionOptions = { checkboxOnly: true };
    this.globalService.updateMenuItem(0);

    this.connectedUser = this.authenticationService.getCurrentUser();
  }

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers() {
    this.users$ = this.authenticationService.getAllUsers(false);
  }

  onRowClick(user: User) {
    this.globalService.setSelectedUser(user);
    this.router.navigate(['../ledger'], { relativeTo: this.route });
  }
}
