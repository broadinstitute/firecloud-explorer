import { Type } from './type';
import { ItemStatus } from './item-status';

export interface Item {
    id: number;
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
    status: ItemStatus;
    transferred: number;
    remaining: number;
}
