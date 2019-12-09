import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Address } from './';
import { AuthenticationService } from '../authentication';
import { Config } from '../config';

@Injectable()
export class AddressService {
  constructor(private readonly httpClient: HttpClient, private readonly authenticationService: AuthenticationService) {}

  getAddresses(inout: string): Observable<Address[]> {
    const clientId = this.authenticationService.getClientId();
    let parameters = `client=${clientId}`;
    if (inout) {
      parameters += `&inout=${inout}`;
    }
    parameters += `&sort=name`;

    return this.httpClient.get<Address[]>(`${Config.apiURL}address?${parameters}&populate=category`);
  }

  getAllUsedAddresses(): Observable<string[]> {
    const clientId = this.authenticationService.getClientId();
    return this.httpClient.get<string[]>(`${Config.apiURL}address/distinct?client=${clientId}`);
  }

  getAddress(id: string): Observable<Address> {
    return this.httpClient.get<Address>(`${Config.apiURL}address/${id}?populate=category`);
  }

  addMultipleAddresses(address: any[]) {
    return this.httpClient.post(`${Config.apiURL}address`, address);
  }

  addNewAddress(address: any): Observable<Address> {
    return this.httpClient.post<Address>(`${Config.apiURL}address`, address);
  }

  updateAddress(address: any): Observable<Address> {
    return this.httpClient.put<Address>(`${Config.apiURL}address/${address.id}`, address);
  }

  deleteAddress(address: any): Observable<any> {
    return this.httpClient.delete<any>(`${Config.apiURL}address/${address.id}`);
  }
}
