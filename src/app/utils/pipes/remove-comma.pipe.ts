import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'removeComma'
})
export class RemoveSpacesPipe implements PipeTransform {
  transform(value: string): string {
    if (value !== undefined && value !== null) {
      return value.replace(/\s/g, '');
    } else {
      return '';
    }
  }
}
