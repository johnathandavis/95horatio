import React from 'react';
import { State as ChessgroundState } from 'chessground/state';
import '../../styles/chessground.css';
import 'normalize.css/normalize.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import '@blueprintjs/core/lib/css/blueprint.css';
export declare class ChessgroundWrapper extends React.Component<{}, {}> {
    static defaultProps: {
        coordinates: boolean;
        resizable: boolean;
        hightlight: {
            lastMove: boolean;
            check: boolean;
        };
    };
    private cg;
    private el;
    buildConfigFromProps(props: any): {
        events: {};
    };
    handleStateChanged(s: ChessgroundState): void;
    componentDidMount(): void;
    componentWillReceiveProps(nextProps: any): void;
    componentWillUnmount(): void;
    render(): JSX.Element;
}
