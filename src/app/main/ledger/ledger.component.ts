import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

import { Entry, EntryItem, EntryService } from '../../shared/entry';
import { SearchTerms } from '../../shared/search-terms/search-terms';
import { AuthenticationService, User } from '../../shared/authentication';
import { Utilities } from '../../utils/utilities';

@Component({
  selector: 'app-ledger',
  templateUrl: './ledger.html',
  styleUrls: ['./ledger.scss']
})
export class LedgerComponent implements OnInit {
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

  constructor(
    private readonly entryService: EntryService,
    private readonly router: Router,
    private readonly authenticationService: AuthenticationService
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

  rowDataBound(args: any) {
    const entry: Entry = args.data;
    if (entry.inout === -1) {
      args.row.classList.add('bg-green-200');
    } else {
      args.row.classList.add('bg-red-200');
    }
  }

  getEntryInOutText(entry: Entry) {
    if (entry.inout === -1) {
      return 'Entrée';
    } else {
      return 'Sortie';
    }
  }
}
