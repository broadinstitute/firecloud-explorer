import { ExportToGCSItem } from '@app/file-manager/models/export-to-gcs-item';
import * as ExportToGCSItemActions from '@app/file-manager/actions/export-to-gcs-item.actions';
import { EntityStatus } from '@app/file-manager/models/entity-status';

export interface ExportToGCSState {
    totalCount: number;
    totalSize: number;
    totalTransferred: number;
    totalProgress: number;
    pending: {
        count: number;
        items: { [id: string]: ExportToGCSItem };
    };

    inProgress: {
        count: number;
        progress: number;
        transferred: number;
        items: { [id: string]: ExportToGCSItem };
    };

    completed: {
        count: number;
        items: { [id: string]: ExportToGCSItem };
    };

    paused: {
        count: number;
        items: { [id: string]: ExportToGCSItem };
    };

    cancelled: {
        count: number;
        items: { [id: string]: ExportToGCSItem };
    };

    failed: {
        count: number;
        items: { [id: string]: ExportToGCSItem };
    };
}

export const exportToGCSInitialState: ExportToGCSState = {

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

export function ExportToGCSReducer(
    state: ExportToGCSState = exportToGCSInitialState,
    action: ExportToGCSItemActions.All) {

    switch (action.type) {
        case ExportToGCSItemActions.ADD_ITEM:
            action.payload.status = EntityStatus.PENDING;
            state.pending.count++;
            state.totalCount++;
            state.totalSize += Number(action.payload.size);
            state.pending.items[action.payload.id] = action.payload;
            break;

        case ExportToGCSItemActions.ADD_ITEMS:
            action.payload.items.forEach(item => {
                item.status = EntityStatus.PENDING;
                state.pending.count++;
                state.totalCount++;
                state.totalSize += Number(item.size);
                state.pending.items[item.id] = item;
            });
            break;

        case ExportToGCSItemActions.PROCESS_ITEM:
            state.pending.count--;
            delete state.pending.items[action.payload.id];
            action.payload.status = EntityStatus.INPROGRESS;
            state.inProgress.count++;
            state.inProgress.items[action.payload.id] = action.payload;
            break;

        case ExportToGCSItemActions.PROCESS_ITEMS:
            action.payload.items.forEach(item => {
                if (item.metadata) {
                    item.metadata['sourceId'] = item.id;
                } else {
                    item.metadata = { 'sourceId': item.id };
                }
                state.pending.count--;
                delete state.pending.items[item.id];
                item.status = EntityStatus.INPROGRESS;
                state.inProgress.count++;
                state.inProgress.items[item.id] = item;
            });
            break;

        case ExportToGCSItemActions.COMPLETE_ITEM:
            state.completed.count++;
            state.completed.items[action.payload.sourceId] = state.inProgress.items[action.payload.sourceId];
            state.completed.items[action.payload.sourceId].status = EntityStatus.COMPLETED;
            state.completed.items[action.payload.sourceId].progress = 100;
            state.completed.items[action.payload.sourceId].transferred = action.payload.transferred;
            delete state.inProgress.items[action.payload.sourceId];
            state.inProgress.count--;
            break;

        case ExportToGCSItemActions.COMPLETE_ITEMS:
            action.payload.items.forEach(item => {
                const sourceId = item.sourceId;
                state.completed.count++;
                state.completed.items[sourceId] = state.inProgress.items[sourceId];
                state.completed.items[sourceId].status = EntityStatus.COMPLETED;
                state.completed.items[sourceId].progress = 100;
                state.completed.items[sourceId].transferred = item.transferred;
                delete state.inProgress.items[sourceId];
                state.inProgress.count--;
            });
            break;

        case ExportToGCSItemActions.PAUSE_ITEM:
            state.inProgress.count--;
            delete state.inProgress.items[action.payload.id];
            action.payload.status = EntityStatus.PAUSED;
            state.paused.count++;
            state.paused.items[action.payload.id] = action.payload;
            break;

        case ExportToGCSItemActions.PAUSE_ITEMS:
            action.payload.items.forEach(item => {
                state.inProgress.count--;
                delete state.inProgress.items[item.id];
                item.status = EntityStatus.PAUSED;
                state.paused.count++;
                state.paused.items[item.id] = item;
            });
            break;

        case ExportToGCSItemActions.CANCEL_ITEM:
            state.inProgress.count--;
            delete state.inProgress.items[action.payload.id];
            action.payload.status = EntityStatus.CANCELED;
            state.cancelled.count++;
            state.cancelled.items[action.payload.id] = action.payload;
            break;

        case ExportToGCSItemActions.CANCEL_ITEMS:
            action.payload.items.forEach(item => {
                state.inProgress.count--;
                delete state.inProgress.items[item.id];
                action.payload.status = EntityStatus.CANCELED;
                state.cancelled.count++;
                state.cancelled.items[item.id] = item;
            });
            break;

        case ExportToGCSItemActions.CANCEL_ALL:
            if (state.pending.count > 0) {
                // NOTE: UPLOADS, GCS, S3 cancel from PENDING instead of INPROGRESS
                Object.keys(state.pending.items).forEach(id => {
                    state.cancelled.count++;
                    state.cancelled.items[id] = state.pending.items[id];
                    state.cancelled.items[id].status = EntityStatus.CANCELED;
                    state.pending.count--;
                    delete state.pending.items[id];
                });
            }
            break;

        case ExportToGCSItemActions.FAIL_ITEM:
            state.inProgress.count--;
            delete state.inProgress.items[action.payload.id];
            action.payload.state = EntityStatus.FAILED;
            state.failed.count++;
            state.failed.items[action.payload.id] = action.payload;
            break;

        case ExportToGCSItemActions.FAIL_ITEMS:
            action.payload.items.forEach(item => {

                const sourceId = item.id;
                state.failed.count++;
                state.failed.items[sourceId] = state.inProgress.items[sourceId];
                state.failed.items[sourceId].status = EntityStatus.FAILED;
                state.failed.items[sourceId].progress = 100;
                state.failed.items[sourceId].transferred = item.transferred;

                delete state.inProgress.items[sourceId];
                state.inProgress.count--;
            });
            break;

        case ExportToGCSItemActions.UPDATE_ITEM_PROGRESS:
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

        case ExportToGCSItemActions.RESET:

            state.totalSize = 0;
            state.totalCount = 0;
            state.totalProgress = 0;
            state.totalTransferred = 0;
            state.pending = { count: 0, items: {} };
            state.inProgress = { count: 0, progress: 0, transferred: 0, items: {} };
            state.completed = { count: 0, items: {} };
            state.paused = { count: 0, items: {} };
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
