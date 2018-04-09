import { Action } from '@ngrx/store';
import { UploadItem } from '../models/upload-item';

export const LOAD = '[Upload] Load';
export const FILTER = '[Upload] Filter';
export const RESET = '[Upload] Reset';
export const SELECT_ALL = '[Upload] Select All';
export const UNSELECT_ALL = '[Upload] Unselect All';
export const TOGGLE_SELECTION = '[Upload] Toggle Selection';
export const TOGGLE_ITEM_SELECTION = '[Upload] Toggle Item Selection';
export const ADD_ITEM = '[Upload] Add Item';
export const UPDATE_ITEM = '[Upload] Update Item';
export const REMOVE_ITEM = '[Upload] Remove Item';
export const SELECT_ITEM = '[Upload] Select Item';
export const UPDATE_ITEM_PROGRESS = '[Upload] Update Item Progress';
export const UPDATE_ITEM_COMPLETED = '[Upload] Update Item Completed';
export const UPDATE_ITEM_DOWNLOADING = '[Upload] Update Item Downloading';
export const UPDATE_ITEM_CANCELED =  '[Upload] Update Item Canceled';

export class Load implements Action {
    readonly type = LOAD;
    constructor(public payload: { item: UploadItem }) {}
}

export class Filter implements Action {
    readonly type = FILTER;
    constructor(public payload: { item: UploadItem }) {}
}

export class Reset implements Action {
    readonly type = RESET;
    constructor(public payload: { item: UploadItem }) {}
}

export class SelectAll implements Action {
    readonly type = SELECT_ALL;
}

export class UnselectAll implements Action {
    readonly type = UNSELECT_ALL;
    constructor(public payload: { item: UploadItem }) {}
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
