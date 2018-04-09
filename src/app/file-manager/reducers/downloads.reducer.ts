import { createEntityAdapter, EntityState, EntityAdapter } from '@ngrx/entity';
import { DownloadItem } from '../models/download-item';
import * as DownloadItemActions from '../actions/download-item.actions';

export interface DownloadState extends EntityState<DownloadItem> {
    count: number | 0;
    selectedCount: number | 0;
    downloadingCount: number | 0;
    uploadingCount: number | 0;
    exportingGCPCount: number | 0;
    toExportGCPCount: number | 0;
    toDownloadCount: number | 0;
    toUploadCount: number | 0;
    toExportS3Count: number | 0;
    exportingS3Count: number | 0;
    counter: number[][] | [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0]
    ];
}

export const downloadEntityAdapter: EntityAdapter<DownloadItem> = createEntityAdapter<DownloadItem>();

export const downloadInitialState: DownloadState = downloadEntityAdapter.getInitialState(
    {
        count: 0,
        selectedCount: 0,
        downloadingCount: 0,
        uploadingCount: 0,
        exportingGCPCount: 0,
        toExportGCPCount: 0,
        toDownloadCount: 0,
        toUploadCount: 0,
        toExportS3Count: 0,
        exportingS3Count: 0,
        counter: [
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0]
        ]
    });

export function DownloadsReducer(
    state: DownloadState = downloadInitialState,
    action: DownloadItemActions.All) {

    switch (action.type) {
        case DownloadItemActions.ADD_ITEM:
            return downloadEntityAdapter.addOne(action.payload.item, state);

        case DownloadItemActions.UPDATE_ITEM:
            return downloadEntityAdapter.updateOne(action.payload.item, state);

        case DownloadItemActions.REMOVE_ITEM:
            return downloadEntityAdapter.removeOne(action.payload.id, state);

        default:
            return state;

        // addOne, addMany, addAll, removeOne, removeMany, removeAll, updateOne and updateMany
    }
}