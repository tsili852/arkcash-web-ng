import { Pipe, PipeTransform } from '@angular/core';
import { User } from '../../shared/authentication';

@Pipe({
  name: 'userSearch',
  pure: false
})
export class UserSearchPipe implements PipeTransform {
  transform(users: User[], filterBy: string): User[] {
    filterBy = filterBy ? filterBy.toLocaleLowerCase() : null;

    return filterBy
      ? users.filter((user: User) => {
          return user.name.toLocaleLowerCase().indexOf(filterBy) !== -1 || user.username.toLocaleLowerCase().indexOf(filterBy) !== -1;
        })
      : users;
  }
}
