import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { User } from './authentication';

@Injectable()
export class GlobalService {
  private userCanceledInstall: boolean;
  private selectedLanguage: string;
  private selectedUser: User;

  private menuChoice: number;
  menuChoice$: Subject<number> = new Subject<number>();

  constructor() {
    this.userCanceledInstall = localStorage.getItem('cancel_install') === 'true' || false;
    this.selectedLanguage = localStorage.getItem('language') || 'en';
  }

  setUserCancelInstall(choice: boolean) {
    this.userCanceledInstall = choice;
    localStorage.setItem('cancel_install', choice.toString());
  }

  getUserCancelInstall(): boolean {
    return this.userCanceledInstall;
  }

  resetUserCancelInstall() {
    this.userCanceledInstall = false;
    localStorage.setItem('cancel_install', 'false');
  }

  getSelectedLanguage(): string {
    return this.selectedLanguage;
  }

  setSelectedLanguage(language: string) {
    this.selectedLanguage = language;
    localStorage.setItem('language', language);
  }

  clearAll(): void {
    localStorage.clear();
  }

  getSelectedUser(): User {
    return this.selectedUser;
  }

  setSelectedUser(user: User) {
    this.selectedUser = user;
  }

  updateMenuItem(itemNumber: number) {
    this.menuChoice = itemNumber;
    this.menuChoice$.next(itemNumber);
  }

  getMenuChoice$(): Observable<number> {
    return this.menuChoice$.asObservable();
  }
}
