import { DownloadItem } from '@app/file-manager/models/download-item';
import * as DownloadItemActions from '@app/file-manager/actions/download-item.actions';
import { EntityStatus } from '@app/file-manager/models/entity-status';

export interface DownloadState {
    totalCount: number;
    totalSize: number;
    totalTransferred: number;
    totalProgress: number;
    pending: {
        count: number;
        items: { [id: string]: DownloadItem };
    };

    inProgress: {
        count: number;
        progress: number;
        transferred: number;
        items: { [id: string]: DownloadItem };
    };

    completed: {
        count: number;
        items: { [id: string]: DownloadItem };
    };

    paused: {
        count: number;
        items: { [id: string]: DownloadItem };
    };

    cancelled: {
        count: number;
        items: { [id: string]: DownloadItem };
    };

    failed: {
        count: number;
        items: { [id: string]: DownloadItem };
    };
}

export const downloadInitialState: DownloadState = {

    totalCount: 0,
    totalSize: 0,
    totalTransferred: 0,
    totalProgress: 0,
    pending: {
        count: 0,
        items: {}
    },
    inProgress: {
        count: 0,
        progress: 0,
        transferred: 0,
        items: {}
    },
    completed: {
        count: 0,
        items: {}
    },
    paused: {
        count: 0,
        items: {}
    },
    cancelled: {
        count: 0,
        items: {}
    },
    failed: {
        count: 0,
        items: {}
    }
};

export function DownloadsReducer(
    state: DownloadState = downloadInitialState,
    action: DownloadItemActions.All) {

    switch (action.type) {
        case DownloadItemActions.ADD_ITEM:
            action.payload.status = EntityStatus.PENDING;
            state.pending.count++;
            state.totalCount++;
            state.totalSize += Number(action.payload.size);
            state.pending.items[action.payload.id] = action.payload;
            break;

        case DownloadItemActions.ADD_ITEMS:
            if (action.payload.clear === true) {
                state = downloadInitialState;
            }
            action.payload.items.forEach(item => {
                item.status = EntityStatus.PENDING;
                state.pending.count++;
                state.totalCount++;
                state.totalSize += Number(item.size);
                state.pending.items[item.id] = item;
            });
            break;

        case DownloadItemActions.PROCESS_ITEM:
            state.pending.count--;
            delete state.pending.items[action.payload.id];
            action.payload.status = EntityStatus.INPROGRESS;
            state.inProgress.count++;
            state.inProgress.items[action.payload.id] = action.payload;
            break;

        case DownloadItemActions.PROCESS_ITEMS:
            action.payload.items.forEach(item => {
                state.pending.count--;
                delete state.pending.items[item.id];
                item.status = EntityStatus.INPROGRESS;
                state.inProgress.count++;
                state.inProgress.items[item.id] = item;
            });
            break;

        case DownloadItemActions.COMPLETE_ITEM:
            // update total transferred
            state.totalTransferred -= state.inProgress.items[action.payload.id].transferred;
            state.totalTransferred += action.payload.transferred;

            // update inProgress transferred
            state.inProgress.transferred -= state.inProgress.items[action.payload.id].transferred;
            state.inProgress.transferred += action.payload.transferred;

            // remove from "inProgress"
            state.inProgress.count--;
            delete state.inProgress.items[action.payload.id];

            // add to "complete"
            action.payload.status = EntityStatus.COMPLETED;
            state.completed.count++;
            state.completed.items[action.payload.id] = action.payload;

            // increment new values
            // state.completed.transferred += action.payload.transferred;

            state.totalProgress = state.totalSize !== 0 ? 100.0 * state.totalTransferred / state.totalSize : 0;
            state.inProgress.progress = state.totalSize !== 0 ? state.inProgress.transferred / state.totalSize : 0;
            break;

        case DownloadItemActions.COMPLETE_ITEMS:
            action.payload.items.forEach(item => {
                // update total transferred
                state.totalTransferred -= state.inProgress.items[item.id].transferred;
                state.totalTransferred += item.transferred;

                // update inProgress transferred
                state.inProgress.transferred -= state.inProgress.items[item.id].transferred;
                state.inProgress.transferred += item.transferred;

                // remove from "inProgress"
                state.inProgress.count--;
                delete state.inProgress.items[item.id];

                // add to "complete"
                item.status = EntityStatus.COMPLETED;
                state.completed.count++;
                state.completed.items[item.id] = item;

            });
            state.totalProgress = state.totalSize !== 0 ? 100.0 * state.totalTransferred / state.totalSize : 0;
            state.inProgress.progress = state.totalSize !== 0 ? state.inProgress.transferred / state.totalSize : 0;
            break;

        case DownloadItemActions.PAUSE_ITEM:
            state.inProgress.count--;
            delete state.inProgress.items[action.payload.id];
            action.payload.status = EntityStatus.PAUSED;
            state.paused.count++;
            state.paused.items[action.payload.id] = action.payload;
            break;

        case DownloadItemActions.PAUSE_ITEMS:
            action.payload.items.forEach(item => {
                state.inProgress.count--;
                delete state.inProgress.items[item.id];
                item.status = EntityStatus.PAUSED;
                state.paused.count++;
                state.paused.items[item.id] = item;
            });
            break;

        case DownloadItemActions.CANCEL_ITEM:
            state.inProgress.count--;
            delete state.inProgress.items[action.payload.id];
            action.payload.status = EntityStatus.CANCELED;
            state.cancelled.count++;
            state.cancelled.items[action.payload.id] = action.payload;
            break;

        case DownloadItemActions.CANCEL_ITEMS:
            action.payload.items.forEach(item => {
                state.inProgress.count--;
                delete state.inProgress.items[item.id];
                action.payload.status = EntityStatus.CANCELED;
                state.cancelled.count++;
                state.cancelled.items[item.id] = item;
            });
            break;

        case DownloadItemActions.FAIL_ITEM:
            state.inProgress.count--;
            delete state.inProgress.items[action.payload.id];
            action.payload.state = EntityStatus.FAILED;
            state.failed.count++;
            state.failed.items[action.payload.id] = action.payload;
            break;

        case DownloadItemActions.FAIL_ITEMS:
            action.payload.items.forEach(item => {
                state.inProgress.count--;
                delete state.inProgress.items[item.id];
                item.status = EntityStatus.FAILED;
                state.failed.count++;
                state.failed.items[item.id] = item;
            });
            break;

        case DownloadItemActions.UPDATE_ITEM_PROGRESS:
            // decrement old values
            state.totalTransferred -= state.inProgress.items[action.payload.id].transferred;
            state.inProgress.transferred -= state.inProgress.items[action.payload.id].transferred;

            // update item
            state.inProgress.items[action.payload.id].progress = action.payload.progress;
            state.inProgress.items[action.payload.id].transferred = action.payload.transferred;

            // increment new values
            state.totalTransferred += state.inProgress.items[action.payload.id].transferred;
            state.inProgress.transferred += state.inProgress.items[action.payload.id].transferred;

            state.totalProgress = state.totalSize !== 0 ? 100.0 * state.totalTransferred / state.totalSize : 0;
            state.inProgress.progress = state.totalSize !== 0 ? state.inProgress.transferred / state.totalSize : 0;
            break;

        case DownloadItemActions.RESET:

            state.totalSize = 0;
            state.totalCount = 0;
            state.totalProgress = 0;
            state.totalTransferred = 0;

            state.pending.count = 0;
            state.pending.items = {};

            state.inProgress.count = 0;
            state.inProgress.progress = 0;
            state.inProgress.transferred = 0;
            state.inProgress.items = {};

            state.completed.count = 0;
            state.completed.items = {};

            state.paused.count = 0;
            state.paused.items = {};

            state.cancelled = { count: 0, items: {} };
            state.failed = { count: 0, items: {} };
            break;

        default:
            return state;
    }

    return {
        totalCount: state.totalCount,
        totalSize: state.totalSize,
        totalProgress: state.totalProgress,
        totalTransferred: state.totalTransferred,
        pending: {
            count: state.pending.count,
            items: state.pending.items
        },
        inProgress: {
            count: state.inProgress.count,
            progress: state.inProgress.progress,
            transferred: state.inProgress.transferred,
            items: state.inProgress.items
        },
        completed: {
            count: state.completed.count,
            items: state.completed.items
        },

        paused: {
            count: state.paused.count,
            items: state.paused.items
        },

        cancelled: {
            count: state.cancelled.count,
            items: state.cancelled.items
        },

        failed: {
            count: state.failed.count,
            items: state.failed.items
        }
    };
}