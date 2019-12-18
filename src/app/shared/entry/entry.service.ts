import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GlobalService } from '../global.service';
import { SearchTerms } from '../search-terms/search-terms';
import { DatePipe } from '@angular/common';
import { Entry } from './';
import { Config } from '../config';

@Injectable()
export class EntryService {
  constructor(private readonly globalService: GlobalService, private readonly httpClient: HttpClient, private datePipe: DatePipe) {}

  getEntries(skip: number, amount: number, inout: string, searchTerms: SearchTerms, clientId: string): Observable<Entry[]> {
    let amountTo;

    if (searchTerms.amountTo === 0.0) {
      amountTo = 999999999;
    } else {
      amountTo = searchTerms.amountTo;
    }

    let dateFromConverted: string;
    if (!searchTerms.dateFrom) {
      dateFromConverted = '';
    } else {
      dateFromConverted = this.datePipe.transform(searchTerms.dateFrom, 'yyyy-MM-ddT') + '00:00:00';
    }

    const dateToConverted = this.datePipe.transform(searchTerms.dateTo, 'yyyy-MM-ddT') + '23:59:59';
    let exportedString = 'false';
    if (searchTerms.exportees) {
      exportedString = '';
    }

    return this.httpClient.get<Entry[]>(
      Config.apiURL +
        'entries?client=' +
        clientId +
        '&skip=' +
        skip +
        '&limit=' +
        amount +
        '&inout=' +
        inout +
        '&exported=' +
        exportedString +
        '&sort=-pieceNo' +
        // '&sort=-entryDate' +
        '&amountfrom=' +
        searchTerms.amountFrom +
        '&amountto=' +
        amountTo +
        '&datefrom=' +
        dateFromConverted +
        '&dateto=' +
        dateToConverted
    );
  }

  getEntriesTotal(): Observable<any> {
    return this.httpClient.get<any>(`${Config.apiURL}entries/total/client/${this.globalService.getSelectedUser().id}`);
  }

  getEntriesTotalAll(): Observable<{ _id: string; total: number }[]> {
    return this.httpClient.get<{ _id: string; total: number }[]>(`${Config.apiURL}entries/total/client/all`);
  }

  getEntry(id: string): Observable<Entry> {
    return this.httpClient.get<Entry>(`${Config.apiURL}entry/${id}?populate=address,client,drawer,entryitems.category`);
  }

  getPieceNo(): Observable<any> {
    return this.httpClient.get<any>(`${Config.apiURL}pieceno/${this.globalService.getSelectedUser().id}`);
  }

  addNewEntry(entry: any): Observable<Entry> {
    return this.httpClient.post<Entry>(`${Config.apiURL}entry`, entry);
  }

  updateEntry(entry: any): Observable<Entry> {
    return this.httpClient.put<Entry>(`${Config.apiURL}entry/${entry.id}`, entry);
  }

  deleteEntry(entry: any): Observable<any> {
    return this.httpClient.delete<any>(`${Config.apiURL}entry/${entry.id}`);
  }
}
