import { ClassificationCategory } from './Category';
export interface ClassificationTask {
    initialFen: string;
    categories: ClassificationCategory[];
    perspective: 'white' | 'black';
}
