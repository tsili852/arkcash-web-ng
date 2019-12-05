import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { L10n, setCulture } from '@syncfusion/ej2-base';
import { GridComponent } from '@syncfusion/ej2-angular-grids';

import { environment } from '../../../environments/environment';
import { Entry, EntryItem, EntryService } from '../../shared/entry';
import { SearchTerms } from '../../shared/search-terms/search-terms';
import { AuthenticationService, User } from '../../shared/authentication';
import { Utilities } from '../../utils/utilities';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

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

  constructor(
    private readonly entryService: EntryService,
    private readonly router: Router,
    private readonly authenticationService: AuthenticationService,
    private readonly zone: NgZone
  ) {
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
      this.grid.columns[7]['visible'] = true;
    } else {
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
}
