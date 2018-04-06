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

  static readonly IPENDING = 0;
  static readonly IDOWNLOADING = 1;
  static readonly IUPLOADING = 2;
  static readonly ICOMPLETED = 3;
  static readonly ICANCELED = 4;
  static readonly IEXPORTING_S3 = 5;
  static readonly IEXPORTED_S3 = 6;
  static readonly IEXPORTING_GCP = 7;
  static readonly IFAILED = 8;

  static lenght = 9;

}

