import { Pipe, PipeTransform } from '@angular/core';
import { Entry } from '../../shared/entry';

@Pipe({
  name: 'entrySearch',
  pure: false
})
export class EntrySearchPipe implements PipeTransform {
  transform(entries: Entry[], filterBy: string): Entry[] {
    filterBy = filterBy ? filterBy.toLocaleLowerCase() : null;

    return filterBy
      ? entries.filter((entry: Entry) => {
          return entry.address.name.toLocaleLowerCase().indexOf(filterBy) !== -1;
        })
      : entries;
  }
}
