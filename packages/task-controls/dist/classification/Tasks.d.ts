export interface ClassificationCategory {
    label: string;
    name: string;
    description?: string;
}
export interface PositionalClassificationTask {
    initialFen: string;
    categories: ClassificationCategory[];
    perspective: 'white' | 'black';
}
