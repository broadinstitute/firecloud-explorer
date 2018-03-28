// transerables.ts
import { Action } from '@app/core';
import * as TransferablesActions from '../actions/transferables.actions';
import { Item } from '../models/item';
import { ItemStatus } from '@app/file-manager/models/item-status';
import { Type } from '@app/file-manager/models/type';

export type Action = TransferablesActions.All;

export class TransferableState {
  items: Item[];

  constructor(items: Item[]) {
    this.items = items;
    sortList(items);
  }

  get count(): number {
    return this.items.length;
  }

  get selectedCount(): number {
    return this.items.filter(x => x.selected === true).length;
  }

  get downloadingCount(): number {
    return this.items.filter(x => x.status === ItemStatus.COMPLETED && x.type === Type.DOWNLOAD).length;
  }

  get uploadingCount(): number {
    return this.items.filter(x => x.status === ItemStatus.COMPLETED && x.type === Type.UPLOAD).length;
  }

  get toDownloadCount(): number {
    return this.items.filter(x => x.type === Type.DOWNLOAD).length;
  }

  get toUploadCount(): number {
    return this.items.filter(x => x.type === Type.UPLOAD).length;
  }

  get toExportS3Count(): number {
    return this.items.filter(x => x.type === Type.EXPORT_S3).length;
  }

  get exportingS3Count(): number {
    return this.items.filter(x => x.status === ItemStatus.COMPLETED && x.type === Type.EXPORT_S3).length;
  }
    get exportingGCPCount(): number {
        return this.items.filter(x => x.status === ItemStatus.COMPLETED && x.type === Type.EXPORT_GCP).length;
    }

    get toExportGCPCount(): number {
        return this.items.filter(x => x.type === Type.EXPORT_GCP).length;
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
            } else if (b.status === ItemStatus.DOWNLOADING || b.status === ItemStatus.UPLOADING || b.status === ItemStatus.EXPORTING_GCP) {
              return 1;
            } else {
              return -1;
            }
          case ItemStatus.PENDING:
            if (b.status === a.status) {
                return 0;
            } else if (b.status === ItemStatus.DOWNLOADING || b.status === ItemStatus.UPLOADING || b.status === ItemStatus.EXPORTING_GCP ||
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
    items: []
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
            return new TransferableState(
                state.items.filter(item => {
                    item.selected = true;
                    return true;
                })
            );

        case TransferablesActions.UNSELECT_ALL:
            return new TransferableState(
                state.items.filter(item => {
                    item.selected = false;
                    return true;
                })
            );

        case TransferablesActions.TOGGLE_SELECTION:
            return new TransferableState(
                state.items.filter(item => {
                    item.selected = !item.selected;
                    return true;
                })
            );

        case TransferablesActions.TOGGLE_ITEM_SELECTION:
            return new TransferableState(
                state.items.filter(item => {
                    if (item.id === action.payload.id) {
                        item.selected = !item.selected;
                    }
                    return true;
                })
            );

        case TransferablesActions.ADD_ITEM:
            const add_item = [...state.items, action.payload];
            return new TransferableState(add_item);

        case TransferablesActions.UPDATE_ITEM:
            const upd_item = state.items.filter(item => item.id !== action.payload.id);
            const tmp1 = [...upd_item, action.payload];
            return new TransferableState(tmp1);

        case TransferablesActions.REMOVE_ITEM:
            const rem_item = state.items.filter(item => item.id !== action.payload.id);
            return new TransferableState(rem_item);

        case TransferablesActions.UPDATE_ITEM_PROGRESS:
            state.items.filter(item => {
                if (item.id === action.payload.id) {
                    item.progress = action.payload.progress;
                    item.transferred = action.payload.transferred;
                }
            });
            return state;

        case TransferablesActions.UPDATE_ITEM_COMPLETED:
          state.items.filter(item => {
            if (item.id === action.payload.id) {
                item.status = ItemStatus.COMPLETED;
                item.progress = 100;
                item.transferred = action.payload.size;
            }
          });
          return new TransferableState(state.items);

      case TransferablesActions.UPDATE_ITEM_DOWNLOADING:
        state.items.filter(item => {
          if (item.id === action.payload.id) {
            item.status = ItemStatus.DOWNLOADING;
          }
        });
        return new TransferableState(state.items);

        case TransferablesActions.SELECT_ITEM:
            const sel_item = state.items.filter(item => {
                if (item.id === action.payload.id) {
                    item.selected = action.payload.selected;
                }
                return true;
            });
            return new TransferableState(sel_item);
        case TransferablesActions.UPDATE_ITEM_CANCELED:
            state.items.filter(item => {
                if (item.id === action.payload.id) {
                    item.status = ItemStatus.CANCELED;
                }
            });
            return new TransferableState(state.items);
        default:
            return state;
    }
}


