import { Category } from '../category';

export interface EntryItem {
  category: Category;
  amount: number;
  description: string;
  _id: string;
}
