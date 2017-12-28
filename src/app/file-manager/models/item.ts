import { Type } from './type';

export interface Item {
    id: string;
    name: string;
    created: Date;
    updated: Date;
    size: number;
    icon: string;
    selected: boolean;
    mediaLink: string;
    path: string;
    preserveStructure: boolean;
    destination: string;
    progress: number;
    type: Type;
    status: string;
    transferred: number;
    remaining: number;
}
