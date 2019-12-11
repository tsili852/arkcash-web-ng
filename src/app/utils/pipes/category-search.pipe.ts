import { Pipe, PipeTransform } from '@angular/core';
import { Category } from '../../shared/category';

@Pipe({
  name: 'categorySearch',
  pure: false
})
export class CategorySearchPipe implements PipeTransform {
  transform(categories: Category[], filterBy: string): Category[] {
    filterBy = filterBy ? filterBy.toLocaleLowerCase() : null;

    return filterBy
      ? categories.filter((category: Category) => {
          return category.name.toLocaleLowerCase().indexOf(filterBy) !== -1;
        })
      : categories;
  }
}
