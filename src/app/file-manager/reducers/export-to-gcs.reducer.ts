import { createEntityAdapter, EntityState, EntityAdapter } from '@ngrx/entity';
import { ExportToGCSItem } from '../models/export-to-gcs-item';
import * as ExportToGCSItemActions from '../actions/export-to-gcs-item.actions';

export interface ExportToGCSState extends EntityState<ExportToGCSItem> { }

export const exportToGCSEntityAdapter: EntityAdapter<ExportToGCSItem> = createEntityAdapter<ExportToGCSItem>();

export const exportToGCSinitialState: ExportToGCSState = exportToGCSEntityAdapter.getInitialState();

export function ExportToGCSReducer(
    state: ExportToGCSState = exportToGCSinitialState,
    action: ExportToGCSItemActions.All) {

    switch (action.type) {
        case ExportToGCSItemActions.ADD_ITEM:
            return exportToGCSEntityAdapter.addOne(action.payload.item, state);

        case ExportToGCSItemActions.UPDATE_ITEM:
            return exportToGCSEntityAdapter.updateOne(action.payload.item, state);

        case ExportToGCSItemActions.REMOVE_ITEM:
            return exportToGCSEntityAdapter.removeOne(action.payload.id, state);

        default:
            return state;

        // addOne, addMany, addAll, removeOne, removeMany, removeAll, updateOne and updateMany
    }
}
