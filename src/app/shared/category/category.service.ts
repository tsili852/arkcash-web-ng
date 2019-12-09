import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Category } from './';
import { Config } from '../config';
import { AuthenticationService } from '../authentication';

@Injectable()
export class CategoryService {
  constructor(private readonly httpClient: HttpClient, private readonly authenticationService: AuthenticationService) {}

  getCategories(inout: string): Observable<Category[]> {
    const clientId = this.authenticationService.getClientId();
    let parameters = `client=${clientId}`;
    if (inout) {
      parameters += `&inout=${inout}`;
    }
    parameters += `&sort=name`;

    return this.httpClient.get<Category[]>(`${Config.apiURL}category?${parameters}`);
  }

  getCategory(id: string): Observable<Category> {
    return this.httpClient.get<Category>(`${Config.apiURL}category/${id}`);
  }
}
