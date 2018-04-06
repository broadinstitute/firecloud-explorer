// transerables.ts
import { Action } from '@app/core';
import * as TransferablesActions from '../actions/transferables.actions';
import { Item } from '../models/item';
import { ItemStatus } from '@app/file-manager/models/item-status';
import { Type } from '@app/file-manager/models/type';

export type Action = TransferablesActions.All;

export class TransferableState {
    items: Item[];
    itemsMap: any[];
    counter: number[][];

    constructor(items: Item[], itemsMap: any[], counter: number[][]) {
        this.items = items;
        this.counter = counter;
        this.itemsMap = itemsMap;
        //        sortList(items);
    }

    get count(): number {
        return this.items.length;
    }

    get selectedCount(): number {
        return this.counter[Type.IDOWNLOAD][ItemStatus.ICOMPLETED];
    }

    get downloadingCount(): number {
        return this.counter[Type.IDOWNLOAD][ItemStatus.ICOMPLETED];
    }

    get uploadingCount(): number {
        return this.counter[Type.IUPLOAD][ItemStatus.ICOMPLETED];
    }

    get exportingGCPCount(): number {
        return this.counter[Type.IEXPORT_GCP][ItemStatus.ICOMPLETED];
    }

    get toDownloadCount(): number {
        let m = 0;
        this.counter[Type.IDOWNLOAD].forEach(n => m += n);
        return m;
    }

    get toUploadCount(): number {
        let m = 0;
        this.counter[Type.IUPLOAD].forEach(n => m += n);
        return m;
    }

    get toExportS3Count(): number {
        let m = 0;
        this.counter[Type.IEXPORT_S3].forEach(n => m += n);
        return m;  
    }


    get exportingS3Count(): number {
        return this.counter[Type.IEXPORT_S3][ItemStatus.ICOMPLETED];
    }

    get toExportGCPCount(): number {
        let m = 0;
        this.counter[Type.IEXPORT_GCP].forEach(n => m += n);
        return m;
    }


}

function sortList(items: Item[]) {
  items.sort((a, b) => {
    switch (a.status) {
      case ItemStatus.DOWNLOADING:
        if (b.status === a.status) {
          return 0;
        } else {
          return -1;
        }
      case ItemStatus.UPLOADING:
        if (b.status === a.status) {
          return 0;
        } else if (b.status === ItemStatus.DOWNLOADING) {
          return 1;
        } else {
          return -1;
        }
      case ItemStatus.EXPORTING_GCP:
        if (b.status === a.status) {
          return 0;
        } else if (b.status === ItemStatus.DOWNLOADING || ItemStatus.UPLOADING || ItemStatus.EXPORTING_S3) {
          return 1;
        } else {
          return -1;
        }
      case ItemStatus.EXPORTING_S3:
        if (b.status === a.status) {
          return 0;
        } else if (b.status === ItemStatus.DOWNLOADING || b.status === ItemStatus.UPLOADING
          || b.status === ItemStatus.EXPORTING_GCP) {
          return 1;
        } else {
          return -1;
        }
      case ItemStatus.PENDING:
        if (b.status === a.status) {
          return 0;
        } else if (b.status === ItemStatus.DOWNLOADING || b.status === ItemStatus.UPLOADING
          || b.status === ItemStatus.EXPORTING_GCP ||
          ItemStatus.EXPORTING_S3) {
          return 1;
        } else {
          return -1;
        }
      case ItemStatus.COMPLETED:
        if (b.status === a.status) {
          return 0;
        } else if (b.status === ItemStatus.CANCELED) {
          return -1;
        } else {
          return 1;
        }
      case ItemStatus.CANCELED:
        if (b.status === a.status) {
          return 0;
        } else {
          return 1;
        }
    }
  });
}

const initialCounter = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0]

];

const initialState: TransferableState = {
  count: 0,
  selectedCount: 0,
  downloadingCount: 0,
  uploadingCount: 0,
  exportingGCPCount: 0,
  toExportGCPCount: 0,
  toDownloadCount: 0,
  toUploadCount: 0,
  toExportS3Count: 0,
  exportingS3Count: 0,
    counter: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0]
    
    ],
    items: [],
    itemsMap: []
};

export function TransferablesReducer(state = initialState, action: Action): TransferableState {

    switch (action.type) {

        case TransferablesActions.LOAD:
            return state;

        case TransferablesActions.FILTER:
            return initialState;

        case TransferablesActions.RESET:
            const tmp3 = initialState;
            return tmp3;

        case TransferablesActions.SELECT_ALL:
            state.items.forEach(item => {
                item.selected = true;
            });
            break;

        case TransferablesActions.UNSELECT_ALL:
            state.items.forEach(item => {
                item.selected = false;
            });
            break;

        case TransferablesActions.TOGGLE_SELECTION:
            state.items.forEach(item => {
                item.selected = !item.selected;
            });
            break;

        case TransferablesActions.TOGGLE_ITEM_SELECTION:
            if (action.payload.id in state.itemsMap) {
                state.itemsMap[action.payload.id].selected
                    = !state.itemsMap[action.payload.id].selected;
            }
            break;

        case TransferablesActions.ADD_ITEM:
            state.counter[action.payload.itype][action.payload.istatus]++;
            state.items = [...state.items, action.payload];
            state.itemsMap = { ...state.itemsMap, [action.payload.id]: action.payload };
            break;

        case TransferablesActions.UPDATE_ITEM:
            if (action.payload.id in state.itemsMap) {
                state.counter
                [state.itemsMap[action.payload.id].itype]
                [state.itemsMap[action.payload.id].istatus]--;
            }

            state.itemsMap[action.payload.id] = action.payload;

            state.counter
            [action.payload.itype]
            [action.payload.istatus]++;
            break;

        case TransferablesActions.REMOVE_ITEM:
            if (action.payload.id in state.itemsMap) {
                state.counter
                [state.itemsMap[action.payload.id].itype]
                [state.itemsMap[action.payload.id].istatus]--;
                delete state.itemsMap[action.payload.id];
            }
            break;

        case TransferablesActions.UPDATE_ITEM_PROGRESS:
            if (action.payload.id in state.itemsMap) {
                state.itemsMap[action.payload.id].progress = action.payload.progress;
                state.itemsMap[action.payload.id].transferred = action.payload.transferred;
            }
            break;

        case TransferablesActions.UPDATE_ITEM_COMPLETED:
            if (action.payload.id in state.itemsMap) {

                state.counter
                [state.itemsMap[action.payload.id].itype]
                [state.itemsMap[action.payload.id].istatus]--;

                state.itemsMap[action.payload.id].status = ItemStatus.COMPLETED;
                state.itemsMap[action.payload.id].istatus = ItemStatus.ICOMPLETED;

                state.counter
                [state.itemsMap[action.payload.id].itype]
                [state.itemsMap[action.payload.id].istatus]++;

                state.itemsMap[action.payload.id].progress = 100;
                state.itemsMap[action.payload.id].transferred = action.payload.size;
            }
            break;

        case TransferablesActions.UPDATE_ITEM_DOWNLOADING:
            if (action.payload.id in state.itemsMap) {

                state.counter
                [state.itemsMap[action.payload.id].itype]
                [state.itemsMap[action.payload.id].istatus]--;

                state.itemsMap[action.payload.id].status = ItemStatus.DOWNLOADING;
                state.itemsMap[action.payload.id].istatus = ItemStatus.IDOWNLOADING;

                state.counter
                [state.itemsMap[action.payload.id].itype]
                [state.itemsMap[action.payload.id].istatus]++;

                state.itemsMap[action.payload.id].progress = 100;
                state.itemsMap[action.payload.id].transferred = action.payload.size;

            }
            break;

        case TransferablesActions.SELECT_ITEM:
            if (action.payload.id in state.itemsMap) {

                state.itemsMap[action.payload.id].selected = action.payload.selected;
            }
            break;

        case TransferablesActions.UPDATE_ITEM_CANCELED:
            if (action.payload.id in state.itemsMap) {

                state.counter
                [state.itemsMap[action.payload.id].itype]
                [state.itemsMap[action.payload.id].istatus]--;

                state.itemsMap[action.payload.id].status = ItemStatus.CANCELED;
                state.itemsMap[action.payload.id].istatus = ItemStatus.ICANCELED;
                state.counter
                [state.itemsMap[action.payload.id].itype]
                [state.itemsMap[action.payload.id].istatus]++;

                state.itemsMap[action.payload.id].progress = 100;
                state.itemsMap[action.payload.id].transferred = action.payload.size;
            }
            break;

        default:
            break;
    }
    return new TransferableState(state.items, state.itemsMap, state.counter);
}


