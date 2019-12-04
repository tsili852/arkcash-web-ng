import { Address } from '../address/address';
import { Drawer } from '../drawer/drawer';
import { EntryItem } from './';

export interface Entry {
  pieceNo: number;
  client: string;
  drawer: Drawer;
  address: Address;
  entryitems: EntryItem[];
  exported: boolean;
  entryDate: Date;
  inout: number;
  totalAmount: number;
  id: string;
}
