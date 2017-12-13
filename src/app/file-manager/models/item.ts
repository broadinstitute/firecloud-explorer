export interface Item {
    id: number;
    name: string;
    created: Date;
    updated: Date;
    size: string;
    icon: string;
    selected: boolean;
    mediaLink: string;
    path: string;
    preserveStructure: boolean;
    destination: string;
    progress: number;
}
