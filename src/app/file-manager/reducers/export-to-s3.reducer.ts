import { ExportToS3Item } from '../models/export-to-s3-item';
import * as ExportToS3ItemActions from '../actions/export-to-s3-item.actions';
import { EntityStatus } from '@app/file-manager/models/entity-status';

export interface ExportToS3State {
    pending: {
        count: number;
        items: { [id: string]: ExportToS3Item };
    };

    inProgress: {
        count: number;
        progress: number;
        transferred: number;
        items: { [id: string]: ExportToS3Item };
    };

    completed: {
        count: number;
        items: { [id: string]: ExportToS3Item };
    };

    paused: {
        count: number;
        items: { [id: string]: ExportToS3Item };
    };

    cancelled: {
        count: number;
        items: { [id: string]: ExportToS3Item };
    };

    failed: {
        count: number;
        items: { [id: string]: ExportToS3Item };
    };
}

export const exportToS3InitialState: ExportToS3State = {

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

export function ExportToS3Reducer(
    state: ExportToS3State = exportToS3InitialState,
    action: ExportToS3ItemActions.All) {

    switch (action.type) {
        case ExportToS3ItemActions.ADD_ITEM:
            action.payload.status = EntityStatus.PENDING;
            state.pending.count++;
            state.pending.items[action.payload.id] = action.payload;
            break;

        case ExportToS3ItemActions.ADD_ITEMS:
            console.log('add-items: ', action.payload.items);
            action.payload.items.forEach(item => {
                item.status = EntityStatus.PENDING;
                state.pending.count++;
                state.pending.items[item.id] = item;
            });
            break;

        case ExportToS3ItemActions.PROCESS_ITEM:
            state.pending.count--;
            delete state.pending.items[action.payload.id];
            action.payload.status = EntityStatus.INPROGRESS;
            state.inProgress.count++;
            state.inProgress.items[action.payload.id] = action.payload;
            break;

        case ExportToS3ItemActions.PROCESS_ITEMS:
            console.log('process-items: ', action.payload.items);
            action.payload.items.forEach(item => {
                state.pending.count--;
                delete state.pending.items[item.id];
                item.status = EntityStatus.INPROGRESS;
                state.inProgress.count++;
                state.inProgress.items[item.id] = item;
            });
            break;

        case ExportToS3ItemActions.COMPLETE_ITEM:
            state.inProgress.count--;
            delete state.inProgress.items[action.payload.id];
            action.payload.status = EntityStatus.COMPLETED;
            state.completed.count++;
            state.completed.items[action.payload.id] = action.payload;
            break;

        case ExportToS3ItemActions.COMPLETE_ITEMS:
            console.log('complete-items: ', action.payload.items);
            action.payload.items.forEach(item => {
                state.inProgress.count--;
                delete state.inProgress.items[item.id];
                item.status = EntityStatus.COMPLETED;
                state.completed.count++;
                state.completed.items[item.id] = item;
            });
            break;

        case ExportToS3ItemActions.PAUSE_ITEM:
            state.inProgress.count--;
            delete state.inProgress.items[action.payload.id];
            action.payload.status = EntityStatus.PAUSED;
            state.paused.count++;
            state.paused.items[action.payload.id] = action.payload;
            break;

        case ExportToS3ItemActions.PAUSE_ITEMS:
            action.payload.items.forEach(item => {
                state.inProgress.count--;
                delete state.inProgress.items[item.id];
                item.status = EntityStatus.PAUSED;
                state.paused.count++;
                state.paused.items[item.id] = item;
            });
            break;

        case ExportToS3ItemActions.CANCEL_ITEM:
            state.inProgress.count--;
            delete state.inProgress.items[action.payload.id];
            action.payload.status = EntityStatus.CANCELED;
            state.cancelled.count++;
            state.cancelled.items[action.payload.id] = action.payload;
            break;

        case ExportToS3ItemActions.CANCEL_ITEMS:
            action.payload.items.forEach(item => {
                state.inProgress.count--;
                delete state.inProgress.items[item.id];
                action.payload.status = EntityStatus.CANCELED;
                state.cancelled.count++;
                state.cancelled.items[item.id] = item;
            });
            break;

        case ExportToS3ItemActions.FAIL_ITEM:
            state.inProgress.count--;
            delete state.inProgress.items[action.payload.id];
            action.payload.state = EntityStatus.FAILED;
            state.failed.count++;
            state.failed.items[action.payload.id] = action.payload;
            break;

        case ExportToS3ItemActions.FAIL_ITEMS:
            action.payload.items.forEach(item => {
                state.inProgress.count--;
                delete state.inProgress.items[item.id];
                item.status = EntityStatus.FAILED;
                state.failed.count++;
                state.failed.items[item.id] = item;
            });
            break;


        case ExportToS3ItemActions.UPDATE_ITEM_PROGRESS:
            // decrement old values
            state.inProgress.progress -= state.inProgress.items[action.payload.id].progress;
            state.inProgress.transferred -= state.inProgress.items[action.payload.id].transferred;

            // update item
            state.inProgress.items[action.payload.id].progress = action.payload.progress;
            state.inProgress.items[action.payload.id].transferred = action.payload.transferred;

            // increment new values
            state.inProgress.progress += state.inProgress.items[action.payload.id].progress;
            state.inProgress.transferred += state.inProgress.items[action.payload.id].transferred;
            break;


        // case ExportToS3ItemActions.UPDATE_ITEM:
        //     return downloadEntityAdapter.updateOne(action.payload.item, state);

        // case ExportToS3ItemActions.REMOVE_ITEM:
        //     return downloadEntityAdapter.removeOne(action.payload.id, state);

        default:
            return state;
    }

    return {
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
