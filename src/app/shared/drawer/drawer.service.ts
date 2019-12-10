import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { GlobalService } from '../global.service';
import { Drawer } from './';
import { Config } from '../config';

@Injectable()
export class DrawerService {
  constructor(private readonly globalService: GlobalService, private readonly httpClient: HttpClient) {}

  getDrawerByClient(): Observable<Drawer> {
    return this.httpClient.get<Drawer>(`${Config.apiURL}drawer?client=${this.globalService.getSelectedUser().id}`);
  }
}
