export class ItemStatus {
  static readonly PENDING = 'Pending';
  static readonly DOWNLOADING = 'Downloading';
  static readonly UPLOADING = 'Uploading';
  static readonly COMPLETED = 'Completed';
  static readonly CANCELED = 'Canceled';
  static readonly EXPORTING_GCP = 'Exporting to GCP';
  static readonly FAILED = 'Failed';
}
