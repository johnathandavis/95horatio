import React from 'react';
import { PositionalClassificationTask, ClassificationCategory } from './Tasks';
interface PositionClassifierState {
    categories: {
        [index: string]: boolean;
    };
}
interface PositionClassifierProps {
    task: PositionalClassificationTask;
    onSubmit: (categories: ClassificationCategory[]) => void;
}
export declare class PositionClassifier extends React.Component<PositionClassifierProps, PositionClassifierState> {
    constructor(props: PositionClassifierProps);
    render: () => JSX.Element;
}
export {};
