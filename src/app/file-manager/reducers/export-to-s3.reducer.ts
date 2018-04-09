import { createEntityAdapter, EntityState, EntityAdapter } from '@ngrx/entity';
import { ExportToS3Item } from '../models/export-to-s3-item';
import * as ExportToS3Actions from '../actions/download-item.actions';

export interface ExportToS3State extends EntityState<ExportToS3Item> { }

export const exportToS3EntityAdapter: EntityAdapter<ExportToS3Item> = createEntityAdapter<ExportToS3Item>();

export const exportToS3InitialState: ExportToS3State = exportToS3EntityAdapter.getInitialState();

export function ExportToS3Reducer(
    state: ExportToS3State = exportToS3InitialState,
    action: ExportToS3Actions.All) {

    switch (action.type) {
        case ExportToS3Actions.ADD_ITEM:
            return exportToS3EntityAdapter.addOne(action.payload.item, state);

        case ExportToS3Actions.UPDATE_ITEM:
            return exportToS3EntityAdapter.updateOne(action.payload.item, state);

        case ExportToS3Actions.REMOVE_ITEM:
            return exportToS3EntityAdapter.removeOne(action.payload.id, state);

        default:
            return state;

        // addOne, addMany, addAll, removeOne, removeMany, removeAll, updateOne and updateMany
    }
}