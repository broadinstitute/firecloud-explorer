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
export const ADD_ITEMS = '[Download] Add Items';

export const PROCESS_ITEM = '[Download] Process Item';
export const PROCESS_ITEMS = '[Download] Process Items';

export const COMPLETE_ITEM = '[Download] Complete Item';
export const COMPLETE_ITEMS = '[Download] Complete Items';

export const PAUSE_ITEM = '[Download] Pause Item';
export const PAUSE_ITEMS = '[Download] Pause Items';

export const CANCEL_ITEM = '[Download] Cancel Item';
export const CANCEL_ITEMS = '[Download] Cancel Items';
export const CANCEL_ALL = '[Download] Cancel All Items';

export const FAIL_ITEM = '[Download] Fail Item';
export const FAIL_ITEMS = '[Download] Fail Items';

export const UPDATE_ITEM = '[Download] Update Item';
export const REMOVE_ITEM = '[Download] Remove Item';

export const SELECT_ITEM = '[Download] Select Item';
export const UPDATE_ITEM_PROGRESS = '[Download] Update Item Progress';

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
    constructor() {}
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

export class AddItems implements Action {
    readonly type = ADD_ITEMS;
    constructor(public payload: any) { }
}

export class ProcessItem implements Action {
    readonly type = PROCESS_ITEM;
    constructor(public payload: any) { }
}

export class ProcessItems implements Action {
    readonly type = PROCESS_ITEMS;
    constructor(public payload: any) { }
}

export class CompleteItem implements Action {
    readonly type = COMPLETE_ITEM;
    constructor(public payload: any) { }
}

export class CompleteItems implements Action {
    readonly type = COMPLETE_ITEMS;
    constructor(public payload: any) { }
}

export class PauseItem implements Action {
    readonly type = PAUSE_ITEM;
    constructor(public payload: any) { }
}

export class PauseItems implements Action {
    readonly type = PAUSE_ITEMS;
    constructor(public payload: any) { }
}

export class CancelItem implements Action {
    readonly type = CANCEL_ITEM;
    constructor(public payload: any) { }
}

export class CancelItems implements Action {
    readonly type = CANCEL_ITEMS;
    constructor(public payload: any) { }
}

export class CancelAllItems implements Action {
    readonly type = CANCEL_ALL;
    constructor() { }
}

export class FailItem implements Action {
    readonly type = FAIL_ITEM;
    constructor(public payload: any) { }
}

export class FailItems implements Action {
    readonly type = FAIL_ITEMS;
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

export class UpdateProgress implements Action {
  readonly type = UPDATE_ITEM_PROGRESS;

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
