// downloadables.actions.ts
import { Action } from '@ngrx/store';

export const LOAD = '[Downloadables] Load';
export const FILTER = '[Downloadables] Filter';
export const RESET = '[Downloadables] Reset';
export const SELECT_ALL = '[Downloadables] Select All';
export const UNSELECT_ALL = '[Downloadables] Unselect All';
export const TOGGLE_SELECTION = '[Downloadables] Toggle Selection';
export const TOGGLE_ITEM_SELECTION = '[Downloadables] Toggle Item Selection';
export const ADD_ITEM = '[Downloadables] Add Item';
export const UPDATE_ITEM = '[Downloadables] Update Item';
export const REMOVE_ITEM = '[Downloadables] Remove Item';
export const SELECT_ITEM = '[Downloadables] Select Item';

export class Load implements Action {
    readonly type = LOAD;
}

export class Filter implements Action {
    readonly type = FILTER;
}

export class Reset implements Action {
    readonly type = RESET;
}

export class SelectAll implements Action {
    readonly type = SELECT_ALL;
}

export class UnselectAll implements Action {
    readonly type = UNSELECT_ALL;
}

export class ToggleSelection implements Action {
    readonly type = TOGGLE_SELECTION;
}

export class ToggleItemSelection implements Action {
        readonly type = TOGGLE_ITEM_SELECTION;
        constructor(public payload: any) { }
}

export class AddItem implements Action {
    readonly type = ADD_ITEM;

    constructor(public payload: any) { }
}

export class UpdateItem implements Action {
    readonly type = UPDATE_ITEM;

    constructor(public payload: any) { }
}

export class RemoveItem implements Action {
    readonly type = REMOVE_ITEM;

    constructor(public payload: any) { }
}

export class SelectItem implements Action {
    readonly type = SELECT_ITEM;

    constructor(public payload: any) { }
}

export type All
    = Load
    | Filter
    | Reset
    | SelectAll
    | UnselectAll
    | ToggleSelection
    | ToggleItemSelection
    | AddItem
    | UpdateItem
    | RemoveItem
    | SelectItem
    ;
