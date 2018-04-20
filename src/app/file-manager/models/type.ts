export class Type {
     static readonly DOWNLOAD = 'Download';
     static readonly UPLOAD = 'Upload';
     static readonly FILE = 'File';
     static readonly FOLDER = 'Folder';
     static readonly EXPORT_S3 = 'Export S3';
     static readonly EXPORT_GCP = 'Export GCP';

    static readonly IDOWNLOAD = 0;
    static readonly IUPLOAD = 1;
    static readonly IFILE = 2;
    static readonly IFOLDER = 3;
    static readonly IEXPORT_S3 = 4;
    static readonly IEXPORT_GCP = 5;
}
