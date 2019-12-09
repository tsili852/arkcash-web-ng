import { Category } from '../category';

export interface Address {
  id: string;
  updateAt: Date;
  createdAt: Date;
  client: string;
  name: string;
  category: Category | string;
  inout: number;
  accNo: number;
}
