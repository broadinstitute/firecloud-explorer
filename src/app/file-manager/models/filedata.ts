export interface FileData {
    id: number;
    selfLink: string;
    bucket: string;
    created: Date;
    updated: Date;
    path: string;
    size: number;
    type: string;
    leaf: boolean;
    name: string;
}
