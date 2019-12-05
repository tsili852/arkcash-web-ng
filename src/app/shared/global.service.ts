import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable()
export class GlobalService {
  private userCanceledInstall: boolean;
  private selectedLanguage: string;

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
}
