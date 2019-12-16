import { Category } from '../category';

export interface Address {
  id: string;
  updateAt: Date;
  createdAt: Date;
  client: string;
  name: string;
  category: Category;
  inout: number;
  accNo: number;
  _id?: string;
}
