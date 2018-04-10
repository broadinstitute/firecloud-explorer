import { createEntityAdapter, EntityState, EntityAdapter } from '@ngrx/entity';
import { UploadItem } from '../models/upload-item';
import * as UploadItemActions from '../actions/upload-item.actions';

export interface UploadsState extends EntityState<UploadItem> { }

export const uploadEntityAdapter: EntityAdapter<UploadItem> = createEntityAdapter<UploadItem>();

export const uploadInitialState: UploadsState = uploadEntityAdapter.getInitialState();

export function UploadsReducer(
    state: UploadsState = uploadInitialState,
    action: UploadItemActions.All) {

    switch (action.type) {
        case UploadItemActions.ADD_ITEM:
            return uploadEntityAdapter.addOne(action.payload.item, state);

        case UploadItemActions.UPDATE_ITEM:
            return uploadEntityAdapter.updateOne(action.payload.item, state);

        case UploadItemActions.REMOVE_ITEM:
            return uploadEntityAdapter.removeOne(action.payload.id, state);

        default:
            return state;

        // addOne, addMany, addAll, removeOne, removeMany, removeAll, updateOne and updateMany
    }
}
