import { Item } from './item';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';


export class BucketObjectsDB {
  dataChange: BehaviorSubject<Item[]> = new BehaviorSubject<Item[]>([]);

  get data(): Item[] {
    return this.dataChange.value;
  }

  set data(elems: Item[]) {
    this.dataChange.next(elems);
  }

  constructor() {
    this.data = [];
  }

}
