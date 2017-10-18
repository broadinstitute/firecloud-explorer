// downloadables.ts
import { Action } from '@app/core';
import * as DownloadablesActions from '../actions/downloadables.actions';
import { Item } from '../models/item';

export type Action = DownloadablesActions.All;;

export type DownloadableState = {
    count: number;
    selectedCount: number;
    items: Item[]
};

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
            let tmp3 = initialState;
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
            let add_item = [...state.items, action.payload];
            let add_item_sc = add_item.filter(x => { return x.selected == true }).length;
            let add_item_count = add_item.length;
            return {
                count: add_item_count,
                selectedCount: add_item_sc,
                items: add_item
            };

        case DownloadablesActions.UPDATE_ITEM:
            let upd_item = state.items.filter(item => { return item.id !== action.payload.id; });
            let tmp1 = [...upd_item, action.payload];
            return {
                count: tmp1.length,
                selectedCount: tmp1.filter(x => { return x.selected == true }).length,
                items: tmp1
            };

        case DownloadablesActions.REMOVE_ITEM:
            let rem_item = state.items.filter(item => { return item.id !== action.payload.id; });
            let rem_item_sc = add_item.filter(x => { return x.selected == true }).length;
            let rem_item_count = add_item.length;
            return {
                count: rem_item_count,
                selectedCount: rem_item_sc,
                items: rem_item
            };

        case DownloadablesActions.SELECT_ITEM:
            let sel_item = state.items.filter(x => {
                if (x.id == action.payload.id) {
                    x.selected == action.payload.selected;
                }
                return true;
            });
            let sel_item_sc = sel_item.filter(item => {
                return item.selected == true;
            });

            console.log(JSON.stringify(sel_item_sc, null, 2));
            let sel_item_count = state.count;
            return {
                count: sel_item_count,
                selectedCount: sel_item_sc.length,
                items: sel_item
            };

        default:
            return state;
    }
}
