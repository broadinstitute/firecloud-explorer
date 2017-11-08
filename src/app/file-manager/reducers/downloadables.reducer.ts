// downloadables.ts
import { Action } from '@app/core';
import * as DownloadablesActions from '../actions/downloadables.actions';
import { Item } from '../models/item';

export type Action = DownloadablesActions.All;

export interface DownloadableState {
    count: number;
    selectedCount: number;
    items: Item[];
}

const initialState: DownloadableState = {
    count: 0,
    selectedCount: 0,
    items: []
};

export function DownloadablesReducer(state = initialState, action: Action): DownloadableState {

    switch (action.type) {

        case DownloadablesActions.LOAD:
            return state;

        case DownloadablesActions.FILTER:
            return initialState;

        case DownloadablesActions.RESET:
            const tmp3 = initialState;
            return tmp3;

        case DownloadablesActions.SELECT_ALL:
            return {
                count: state.count,
                selectedCount: state.count,
                items: state.items.filter(item => {
                    item.selected = true;
                    return true;
                })
            };

        case DownloadablesActions.UNSELECT_ALL:
            return {
                count: state.count,
                selectedCount: 0,
                items: state.items.filter(item => {
                    item.selected = false;
                    return true;
                })
            };

        case DownloadablesActions.TOGGLE_SELECTION:
            return {
                count: state.count,
                selectedCount: state.count - state.selectedCount,
                items: state.items.filter(item => {
                    item.selected = !item.selected;
                    return true;
                })
            };

        case DownloadablesActions.ADD_ITEM:
            const add_item = [...state.items, action.payload];
            const add_item_sc = add_item.filter(x => x.selected === true).length;
            const add_item_count = add_item.length;
            return {
                count: add_item_count,
                selectedCount: add_item_sc,
                items: add_item
            };

        case DownloadablesActions.UPDATE_ITEM:
            const upd_item = state.items.filter(item => item.id !== action.payload.id);
            const tmp1 = [...upd_item, action.payload];
            return {
                count: tmp1.length,
                selectedCount: tmp1.filter(x => x.selected === true).length,
                items: tmp1
            };

        case DownloadablesActions.REMOVE_ITEM:
            const rem_item = state.items.filter(item => item.id !== action.payload.id);
            const rem_item_sc = add_item.filter(x => x.selected === true).length;
            const rem_item_count = add_item.length;
            return {
                count: rem_item_count,
                selectedCount: rem_item_sc,
                items: rem_item
            };

        case DownloadablesActions.SELECT_ITEM:
            const sel_item = state.items.filter(item => {
                if (item.id === action.payload.id) {
                    item.selected = action.payload.selected;
                }
                return true;
            });
            const sel_item_sc = sel_item.filter(item => {
                return item.selected === true;
            });

            const sel_item_count = state.count;
            return {
                count: sel_item_count,
                selectedCount: sel_item_sc.length,
                items: sel_item
            };

        default:
            return state;
    }
}
