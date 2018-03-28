export class ItemStatus {
  static readonly PENDING = 'Pending';
  static readonly DOWNLOADING = 'Downloading';
  static readonly UPLOADING = 'Uploading';
  static readonly COMPLETED = 'Completed';
  static readonly CANCELED = 'Canceled';
  static readonly EXPORTING_S3 = 'Exporting to Amazon';
  static readonly EXPORTED_S3 = 'Exported to S3';
  static readonly EXPORTING_GCP = 'Exporting to Google Cloud';
  static readonly FAILED = 'Failed';
}
