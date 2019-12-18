import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Category } from './';
import { Config } from '../config';
import { GlobalService } from '../global.service';

@Injectable()
export class CategoryService {
  constructor(private readonly httpClient: HttpClient, private readonly globalService: GlobalService) {}

  getCategories(inout: string): Observable<Category[]> {
    const clientId = this.globalService.getSelectedUser().id;
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

  getClientCategories(clientId: string): Observable<Category[]> {
    return this.httpClient.get<Category[]>(`${Config.apiURL}category?client=${clientId}`);
  }

  getAllUsedCategories(): Observable<string[]> {
    const clientId = this.globalService.getSelectedUser().id;
    return this.httpClient.get<string[]>(`${Config.apiURL}category/distinct?client=${clientId}`);
  }

  addNewCategory(category: any): Observable<Category> {
    return this.httpClient.post<Category>(`${Config.apiURL}category`, category);
  }

  addCategories(categories: any): Observable<Category[]> {
    return this.httpClient.post<Category[]>(`${Config.apiURL}category`, categories);
  }

  updateCategory(category: any): Observable<Category> {
    return this.httpClient.put<Category>(`${Config.apiURL}category/${category.id}`, category);
  }

  deleteCategory(category: any): Observable<any> {
    return this.httpClient.delete<any>(`${Config.apiURL}category/${category.id}`);
  }
}
