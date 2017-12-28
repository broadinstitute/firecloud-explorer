// transerables.ts
import { Action } from '@app/core';
import * as TransferablesActions from '../actions/transferables.actions';
import { Item } from '../models/item';
import { ItemStatus } from '@app/file-manager/models/item-status';

export type Action = TransferablesActions.All;

export class TransferableState {
    items: Item[];

    constructor(items: Item[]) {
        this.items = items;
    }

    get count(): number {
        return this.items.length;
    }

    get selectedCount(): number {
        return this.items.filter(x => x.selected === true).length;
    }

}

const initialState: TransferableState = {
    count: 0,
    selectedCount: 0,
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
                item.transferred = action.payload.size;
            }
          });
          return state;

      case TransferablesActions.UPDATE_ITEM_DOWNLOADING:
        state.items.filter(item => {
          console.log(item);
          if (item.id === action.payload.id) {
            item.status = ItemStatus.DOWNLOADING;
          }
        });
        return state;

        case TransferablesActions.SELECT_ITEM:
            const sel_item = state.items.filter(item => {
                if (item.id === action.payload.id) {
                    item.selected = action.payload.selected;
                }
                return true;
            });
            return new TransferableState(sel_item);
        default:
            return state;
    }
}
