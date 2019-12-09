import { Pipe, PipeTransform } from '@angular/core';
import { Address } from '../../shared/address';

@Pipe({
  name: 'addressSearch',
  pure: false
})
export class AddressSearchPipe implements PipeTransform {
  transform(addresses: Address[], filterBy: string): Address[] {
    filterBy = filterBy ? filterBy.toLocaleLowerCase() : null;

    return filterBy
      ? addresses.filter((address: Address) => {
          return address.name.toLocaleLowerCase().indexOf(filterBy) !== -1;
        })
      : addresses;
  }
}
