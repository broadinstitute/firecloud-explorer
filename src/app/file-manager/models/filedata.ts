export interface FileData {
    id: number;
    selfLink: string;
    bucket: string;
    created: Date;
    updated: Date;
    path: string;
    size: string;
    type: string;
    leaf: boolean;
}
