import { createEntityAdapter, EntityState, EntityAdapter } from '@ngrx/entity';
import { DownloadItem } from '../models/download-item';
import * as DownloadItemActions from '../actions/download-item.actions';
import { EntityStatus } from '@app/file-manager/models/entity-status';

export interface DownloadState {
    pending: {
        ids: string[];
        items: { [id: string]: DownloadItem[] };
    };

    inProgress: {
        ids: string[];
        items: { [id: string]: DownloadItem[] };
    };

    completed: {
        ids: string[];
        items: { [id: string]: DownloadItem[] };
    };

    paused: {
        ids: string[];
        items: { [id: string]: DownloadItem[] };
    };

    cancelled: {
        ids: string[];
        items: { [id: string]: DownloadItem[] };
    };

    failed: {
        ids: string[];
        items: { [id: string]: DownloadItem[] };
    };
}

// export const pendingDownloadItemEA: EntityAdapter<DownloadItem> = createEntityAdapter<DownloadItem>();
// export const processDownloadItemEA: EntityAdapter<DownloadItem> = createEntityAdapter<DownloadItem>();
// export const completedDownloadItemEA: EntityAdapter<DownloadItem> = createEntityAdapter<DownloadItem>();
// export const pausedDownloadItemEA: EntityAdapter<DownloadItem> = createEntityAdapter<DownloadItem>();
// export const cancelledDownloadItemEA: EntityAdapter<DownloadItem> = createEntityAdapter<DownloadItem>();
// export const failedlDownloadItemEA: EntityAdapter<DownloadItem> = createEntityAdapter<DownloadItem>();

export const downloadInitialState: DownloadState = {

    pending: {
        ids: [],
        items: {}
    },
    inProgress: {
        ids: [],
        items: {}
    },
    completed: {
        ids: [],
        items: {}
    },
    paused: {
        ids: [],
        items: {}
    },
    cancelled: {
        ids: [],
        items: {}
    },
    failed: {
        ids: [],
        items: {}
    }
};

export function DownloadsReducer(
    state: DownloadState = downloadInitialState,
    action: DownloadItemActions.All) {

    switch (action.type) {
        case DownloadItemActions.ADD_ITEM:
            action.payload.status = EntityStatus.PENDING;
            state.pending.items[action.payload.id] = action.payload;
            return state;

        case DownloadItemActions.ADD_ITEMS:
        console.log(action.payload);
            action.payload.items.forEach(item => {
                item.status = EntityStatus.PENDING;
                state.pending.items[item.id] = item;
            });
            return state;

        case DownloadItemActions.PROCESS_ITEM:
            delete state.pending.items[action.payload.id];
            action.payload.status = EntityStatus.INPROGRESS;
            state.inProgress.items[action.payload.id] = action.payload;
            return state;

        case DownloadItemActions.PROCESS_ITEMS:
            action.payload.items.forEach(item => {
                delete state.pending.items[item.id];
                item.status = EntityStatus.INPROGRESS;
                state.inProgress.items[item.id] = item;
            });
            return state;

        case DownloadItemActions.COMPLETE_ITEM:
            delete state.inProgress.items[action.payload.id];
            action.payload.status = EntityStatus.COMPLETED;
            state.completed.items[action.payload.id] = action.payload;
            return state;

        case DownloadItemActions.COMPLETE_ITEM:
            action.payload.items.forEach(item => {
                delete state.inProgress.items[item.id];
                item.status = EntityStatus.COMPLETED;
                state.completed.items[item.id] = item;
            });
            return state;

        case DownloadItemActions.PAUSE_ITEM:
            delete state.inProgress.items[action.payload.id];
            action.payload.status = EntityStatus.PAUSED;
            state.paused.items[action.payload.id] = action.payload;
            return state;

        case DownloadItemActions.PAUSE_ITEMS:
            action.payload.items.forEach(item => {
                delete state.inProgress.items[item.id];
                item.status = EntityStatus.PAUSED;
                state.paused.items[item.id] = item;
            });
            return state;

        case DownloadItemActions.CANCEL_ITEM:
            delete state.inProgress.items[action.payload.id];
            action.payload.status = EntityStatus.CANCELED;
            state.cancelled.items[action.payload.id] = action.payload;
            return state;

        case DownloadItemActions.CANCEL_ITEMS:
            action.payload.items.forEach(item => {
                delete state.inProgress.items[item.id];
                action.payload.status = EntityStatus.CANCELED;
                state.cancelled.items[item.id] = item;
            });
            return state;

        case DownloadItemActions.FAIL_ITEM:
            delete state.inProgress.items[action.payload.id];
            action.payload.state = EntityStatus.FAILED;
            state.failed.items[action.payload.id] = action.payload;
            return state;

        case DownloadItemActions.FAIL_ITEMS:
            action.payload.items.forEach(item => {
                delete state.inProgress.items[item.id];
                item.status = EntityStatus.FAILED;
                state.failed.items[item.id] = item;
            });
            return state;

        // case DownloadItemActions.UPDATE_ITEM:
        //     return downloadEntityAdapter.updateOne(action.payload.item, state);

        // case DownloadItemActions.REMOVE_ITEM:
        //     return downloadEntityAdapter.removeOne(action.payload.id, state);

        default:
            return state;

        // addOne, addMany, addAll, removeOne, removeMany, removeAll, updateOne and updateMany
    }
}
