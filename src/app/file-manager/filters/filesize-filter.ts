import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filesize'
})
export class FilterSizePipe implements PipeTransform {
    readonly LIMIT = 1024;
    readonly BYTES = ' Bytes';
    readonly KB = ' KB';
    readonly MB = ' MB';
    readonly GB = ' GB';
    readonly TB = ' TB';

    transform(size): string {
    if (isNaN(size)) {
      return ' - ';
    } else if (size < this.LIMIT) {
      return size + this.BYTES;
    }
    size /= this.LIMIT;
    if (size < this.LIMIT) {
      return size.toFixed(2) + this.KB;
    }
    size /= this.LIMIT;
    if (size < this.LIMIT) {
      return size.toFixed(2) + this.MB;
    }
    size /= this.LIMIT;
    if (size < this.LIMIT) {
      return size.toFixed(2) + this.GB;
    }
    size /= this.LIMIT;
    return size.toFixed(2) + this.TB;
  }
}
