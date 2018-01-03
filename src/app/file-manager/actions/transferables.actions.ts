// Transferables.actions.ts
import { Action } from '@ngrx/store';

export const LOAD = '[Transferables] Load';
export const FILTER = '[Transferables] Filter';
export const RESET = '[Transferables] Reset';
export const SELECT_ALL = '[Transferables] Select All';
export const UNSELECT_ALL = '[Transferables] Unselect All';
export const TOGGLE_SELECTION = '[Transferables] Toggle Selection';
export const TOGGLE_ITEM_SELECTION = '[Transferables] Toggle Item Selection';
export const ADD_ITEM = '[Transferables] Add Item';
export const UPDATE_ITEM = '[Transferables] Update Item';
export const REMOVE_ITEM = '[Transferables] Remove Item';
export const SELECT_ITEM = '[Transferables] Select Item';
export const UPDATE_ITEM_PROGRESS = '[Transferables] Update Item Progress';
export const UPDATE_ITEM_COMPLETED = '[Transferables] Update Item Completed';
export const UPDATE_ITEM_DOWNLOADING = '[Transferables] Update Item Downloading';
export const UPDATE_ITEM_CANCELED =  '[Transferables] Update Item Canceled';

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

export class UpdateItemProgress implements Action {
  readonly type = UPDATE_ITEM_PROGRESS;

  constructor(public payload: any) { }
}

export class UpdateItemCompleted implements Action {
  readonly type = UPDATE_ITEM_COMPLETED;

  constructor(public payload: any) { }
}

export class UpdateItemDownloading implements Action {
  readonly type = UPDATE_ITEM_DOWNLOADING;

  constructor(public payload: any) { }
}


export class UpdateItemCanceled implements Action {
    readonly type = UPDATE_ITEM_CANCELED;

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
    | UpdateItemProgress
    | UpdateItemCompleted
    | UpdateItemDownloading
    | UpdateItemCanceled
    ;
