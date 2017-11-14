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

export class DownloadableStateImpl implements DownloadableState {
    itms: Item[];

    constructor(itm: Item[]) {
        this.itms = itm;
    }

    get count(): number {
        return this.items.length;
    }

    get selectedCount(): number {
        return this.items.filter(x => x.selected === true).length;
    }

    get items(): Item[] {
        return this.itms;
    }
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
            return new DownloadableStateImpl(
                state.items.filter(item => {
                    item.selected = true;
                    return true;
                })
            );

        case DownloadablesActions.UNSELECT_ALL:
            return new DownloadableStateImpl(
                state.items.filter(item => {
                    item.selected = false;
                    return true;
                })
            );

        case DownloadablesActions.TOGGLE_SELECTION:
            return new DownloadableStateImpl(
                state.items.filter(item => {
                    item.selected = !item.selected;
                    return true;
                })
            );

        case DownloadablesActions.TOGGLE_ITEM_SELECTION:
            return new DownloadableStateImpl(
                state.items.filter(item => {
                    if (item.id === action.payload.id) {
                        item.selected = !item.selected;
                    }
                    return true;
                })
            );

        case DownloadablesActions.ADD_ITEM:
            const add_item = [...state.items, action.payload];
            return new DownloadableStateImpl(add_item);

        case DownloadablesActions.UPDATE_ITEM:
            const upd_item = state.items.filter(item => item.id !== action.payload.id);
            const tmp1 = [...upd_item, action.payload];
            return new DownloadableStateImpl(upd_item);

        case DownloadablesActions.REMOVE_ITEM:
            const rem_item = state.items.filter(item => item.id !== action.payload.id);
            return new DownloadableStateImpl(rem_item);

        case DownloadablesActions.SELECT_ITEM:
            const sel_item = state.items.filter(item => {
                if (item.id === action.payload.id) {
                    item.selected = action.payload.selected;
                }
                return true;
            });
            return new DownloadableStateImpl(sel_item);

        default:
            return state;
    }
}
