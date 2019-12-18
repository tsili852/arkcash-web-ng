import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { User } from './';

import { Config } from '../config';

@Injectable()
export class AuthenticationService {
  private token: string;
  user: User;
  jwtHelper: JwtHelperService;

  constructor(private readonly httpClient: HttpClient) {
    this.jwtHelper = new JwtHelperService();
    this.token = localStorage.getItem('token');
    if (this.token) {
      this.setCurrentUserFromToken(this.token);
    }
  }

  login(user: { username: string; password: string }): Observable<{ token: string }> {
    return this.httpClient.post<{ token: string }>(`${Config.apiURL}login`, user);
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);

    this.setCurrentUserFromToken(token);
  }

  getToken(): string {
    return this.token;
  }

  clearStorage() {
    this.token = '';
    this.user = null;
    localStorage.clear();
  }

  setCurrentUserFromToken(token: string) {
    this.user = this.jwtHelper.decodeToken(token).user;
  }

  getCurrentUser(): User {
    return this.user;
  }

  getClientId(): string {
    return this.user.id || '';
  }

  getLastExportDate(): Date {
    if (this.user && this.user.lastExport) {
      return new Date(this.user.lastExport);
    } else {
      return null;
    }
  }

  getUserFromAPI(userId: string): Observable<User> {
    return this.httpClient.get<User>(`${Config.apiURL}user/${userId}`);
  }

  getAllUsers(isAdmin: boolean): Observable<User[]> {
    return this.httpClient.get<User[]>(`${Config.apiURL}user?isAdmin=${isAdmin}&sort=slug`);
  }

  createUser(userBody: any): Observable<User> {
    return this.httpClient.post<User>(`${Config.apiURL}user`, userBody);
  }

  updateUser(userBody: any): Observable<User> {
    return this.httpClient.put<User>(`${Config.apiURL}user/${userBody.id}`, userBody);
  }

  deleteUser(userId: string): Observable<any> {
    return this.httpClient.delete<any>(`${Config.apiURL}user/${userId}`);
  }
}
