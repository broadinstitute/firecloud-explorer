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
export const ADD_ITEMS = '[Upload] Add Items';

export const PROCESS_ITEM = '[Upload] Process Item';
export const PROCESS_ITEMS = '[Upload] Process Items';

export const COMPLETE_ITEM = '[Upload] Complete Item';
export const COMPLETE_ITEMS = '[Upload] Complete Items';

export const PAUSE_ITEM = '[Upload] Pause Item';
export const PAUSE_ITEMS = '[Upload] Pause Items';

export const CANCEL_ITEM = '[Upload] Cancel Item';
export const CANCEL_ITEMS = '[Upload] Cancel Items';
export const CANCEL_ALL = '[Upload] Cancel All Items';

export const FAIL_ITEM = '[Upload] Fail Item';
export const FAIL_ITEMS = '[Upload] Fail Items';

export const UPDATE_ITEM = '[Upload] Update Item';
export const REMOVE_ITEM = '[Upload] Remove Item';

export const SELECT_ITEM = '[Upload] Select Item';
export const UPDATE_ITEM_PROGRESS = '[Upload] Update Item Progress';

export class Load implements Action {
    readonly type = LOAD;
    constructor(public payload: { item: UploadItem[] }) { }
}

export class Filter implements Action {
    readonly type = FILTER;
    constructor(public payload: { item: UploadItem[] }) { }
}

export class Reset implements Action {
    readonly type = RESET;
    constructor() { }
}

export class SelectAll implements Action {
    readonly type = SELECT_ALL;
}

export class UnselectAll implements Action {
    readonly type = UNSELECT_ALL;
    constructor(public payload: { item: UploadItem[] }) { }
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
    constructor(public payload: UploadItem) { }
}

export class AddItems implements Action {
    readonly type = ADD_ITEMS;
    constructor(public payload: { items: UploadItem[] }) { }
}

export class ProcessItem implements Action {
    readonly type = PROCESS_ITEM;
    constructor(public payload: UploadItem) { }
}

export class ProcessItems implements Action {
    readonly type = PROCESS_ITEMS;
    constructor(public payload: { items: UploadItem[] }) { }
}

export class CompleteItem implements Action {
    readonly type = COMPLETE_ITEM;
    constructor(public payload: UploadItem) { }
}

export class CompleteItems implements Action {
    readonly type = COMPLETE_ITEMS;
    constructor(public payload: { items: UploadItem[] }) { }
}

export class PauseItem implements Action {
    readonly type = PAUSE_ITEM;
    constructor(public payload: UploadItem) { }
}

export class PauseItems implements Action {
    readonly type = PAUSE_ITEMS;
    constructor(public payload: { items: UploadItem[] }) { }
}

export class CancelItem implements Action {
    readonly type = CANCEL_ITEM;
    constructor(public payload: UploadItem) { }
}

export class CancelItems implements Action {
    readonly type = CANCEL_ITEMS;
    constructor(public payload: { items: UploadItem[] }) { }
}

export class CancelAllItems implements Action {
    readonly type = CANCEL_ALL;
    constructor() { }
}

export class FailItem implements Action {
    readonly type = FAIL_ITEM;
    constructor(public payload: UploadItem) { }
}

export class FailItems implements Action {
    readonly type = FAIL_ITEMS;
    constructor(public payload: { items: UploadItem[] }) { }
}

export class UpdateItem implements Action {
    readonly type = UPDATE_ITEM;
    constructor(public payload: UploadItem) { }
}

export class RemoveItem implements Action {
    readonly type = REMOVE_ITEM;
    constructor(public payload: UploadItem) { }
}

export class SelectItem implements Action {
    readonly type = SELECT_ITEM;
    constructor(public payload: UploadItem) { }
}

export class UpdateProgress implements Action {
    readonly type = UPDATE_ITEM_PROGRESS;

    constructor(public payload: UploadItem) { }
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
    | AddItems
    | ProcessItem
    | ProcessItems
    | CompleteItem
    | CompleteItems
    | PauseItem
    | PauseItems
    | CancelItem
    | CancelItems
    | CancelAllItems
    | FailItem
    | FailItems
    | UpdateItem
    | UpdateProgress
    | RemoveItem
    | SelectItem
    ;
