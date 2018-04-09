import { Action } from '@ngrx/store';
import { DownloadItem } from '../models/download-item';

export const LOAD = '[Download] Load';
export const FILTER = '[Download] Filter';
export const RESET = '[Download] Reset';
export const SELECT_ALL = '[Download] Select All';
export const UNSELECT_ALL = '[Download] Unselect All';
export const TOGGLE_SELECTION = '[Download] Toggle Selection';
export const TOGGLE_ITEM_SELECTION = '[Download] Toggle Item Selection';
export const ADD_ITEM = '[Download] Add Item';
export const UPDATE_ITEM = '[Download] Update Item';
export const REMOVE_ITEM = '[Download] Remove Item';
export const SELECT_ITEM = '[Download] Select Item';
export const UPDATE_ITEM_PROGRESS = '[Download] Update Item Progress';
export const UPDATE_ITEM_COMPLETED = '[Download] Update Item Completed';
export const UPDATE_ITEM_DOWNLOADING = '[Download] Update Item Downloading';
export const UPDATE_ITEM_CANCELED =  '[Download] Update Item Canceled';

export class Load implements Action {
    readonly type = LOAD;
    constructor(public payload: { item: DownloadItem }) {}
}

export class Filter implements Action {
    readonly type = FILTER;
    constructor(public payload: { item: DownloadItem }) {}
}

export class Reset implements Action {
    readonly type = RESET;
    constructor(public payload: { item: DownloadItem }) {}
}

export class SelectAll implements Action {
    readonly type = SELECT_ALL;
}

export class UnselectAll implements Action {
    readonly type = UNSELECT_ALL;
    constructor(public payload: { item: DownloadItem }) {}
}

export class ToggleSelection implements Action {
    readonly type = TOGGLE_SELECTION;
    constructor(public payload: any) { }
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
