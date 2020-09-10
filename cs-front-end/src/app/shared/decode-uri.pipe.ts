import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'decodeURI'
})
export class DecodeURIPipe implements PipeTransform {

  transform(value: string): string {
    return decodeURIComponent(value);
  }

}
