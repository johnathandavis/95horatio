import React from 'react';
import { ClassificationCategory } from './Category';
import { ClassificationTask } from './ClassificationTask';
interface MotifClassifierState {
    categories: {
        [index: string]: boolean;
    };
}
interface MotifClassifierProps {
    task: ClassificationTask;
    onSubmit: (categories: ClassificationCategory[]) => void;
}
export declare class MotifClassifier extends React.Component<MotifClassifierProps, MotifClassifierState> {
    constructor(props: MotifClassifierProps);
    render: () => JSX.Element;
}
export {};
