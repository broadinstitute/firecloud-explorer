import { Action } from '@ngrx/store';
import { ExportToS3Item } from '../models/export-to-s3-item';

export const LOAD = '[ExportToS3] Load';
export const FILTER = '[ExportToS3] Filter';
export const RESET = '[ExportToS3] Reset';
export const SELECT_ALL = '[ExportToS3] Select All';
export const UNSELECT_ALL = '[ExportToS3] Unselect All';
export const TOGGLE_SELECTION = '[ExportToS3] Toggle Selection';
export const TOGGLE_ITEM_SELECTION = '[ExportToS3] Toggle Item Selection';
export const ADD_ITEM = '[ExportToS3] Add Item';
export const UPDATE_ITEM = '[ExportToS3] Update Item';
export const REMOVE_ITEM = '[ExportToS3] Remove Item';
export const SELECT_ITEM = '[ExportToS3] Select Item';
export const UPDATE_ITEM_PROGRESS = '[ExportToS3] Update Item Progress';
export const UPDATE_ITEM_COMPLETED = '[ExportToS3] Update Item Completed';
export const UPDATE_ITEM_DOWNLOADING = '[ExportToS3] Update Item Downloading';
export const UPDATE_ITEM_CANCELED =  '[ExportToS3] Update Item Canceled';

export class Load implements Action {
    readonly type = LOAD;
    constructor(public payload: { item: ExportToS3Item }) {}
}

export class Filter implements Action {
    readonly type = FILTER;
    constructor(public payload: { item: ExportToS3Item }) {}
}

export class Reset implements Action {
    readonly type = RESET;
    constructor(public payload: { item: ExportToS3Item }) {}
}

export class SelectAll implements Action {
    readonly type = SELECT_ALL;
}

export class UnselectAll implements Action {
    readonly type = UNSELECT_ALL;
    constructor(public payload: { item: ExportToS3Item }) {}
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
