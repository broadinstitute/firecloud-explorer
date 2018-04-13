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
export const ADD_ITEMS = '[ExportToS3] Add Items';

export const PROCESS_ITEM = '[ExportToS3] Process Item';
export const PROCESS_ITEMS = '[ExportToS3] Process Items';

export const COMPLETE_ITEM = '[ExportToS3] Complete Item';
export const COMPLETE_ITEMS = '[ExportToS3] Complete Items';

export const PAUSE_ITEM = '[ExportToS3] Pause Item';
export const PAUSE_ITEMS = '[ExportToS3] Pause Items';

export const CANCEL_ITEM = '[ExportToS3] Cancel Item';
export const CANCEL_ITEMS = '[ExportToS3] Cancel Items';
export const CANCEL_ALL = '[ExportToS3] Cancel All Items';

export const FAIL_ITEM = '[ExportToS3] Cancel Item';
export const FAIL_ITEMS = '[ExportToS3] Cancel Items';

export const UPDATE_ITEM = '[ExportToS3] Update Item';
export const REMOVE_ITEM = '[ExportToS3] Remove Item';

export const SELECT_ITEM = '[ExportToS3] Select Item';

export const UPDATE_ITEM_PROGRESS = '[ExportToS3] Update Item Progress';

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
    constructor() {}
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
