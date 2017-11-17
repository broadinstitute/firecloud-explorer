import { TestBed, inject } from '@angular/core/testing';

import { FilterSizePipe } from './filesize-filter';

describe('FilterSizePipe', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FilterSizePipe]
    });
  });

  it('returns value in KB', inject([FilterSizePipe], (filterSizePipe: FilterSizePipe) => {
    expect(filterSizePipe.transform(1090)).toBe(1.06 +  filterSizePipe.KB);
  }));

  it('returns value in GB', inject([FilterSizePipe], (filterSizePipe: FilterSizePipe) => {
    expect(filterSizePipe.transform(18760536887)).toBe(17.47 + filterSizePipe.GB);
  }));

  it('returns value in Bytes', inject([FilterSizePipe], (filterSizePipe: FilterSizePipe) => {
    expect(filterSizePipe.transform(33)).toBe(33 +  filterSizePipe.BYTES);
  }));

  it('returns value in MB', inject([FilterSizePipe], (filterSizePipe: FilterSizePipe) => {
    expect(filterSizePipe.transform(1530492)).toBe(1.46 +  filterSizePipe.MB);
  }));

  it('returns 0 when the value is not valid', inject([FilterSizePipe], (filterSizePipe: FilterSizePipe) => {
    expect(filterSizePipe.transform('Test')).toBe(0 +  filterSizePipe.BYTES);
  }));

});
