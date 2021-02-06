import { Component } from 'react';
export declare type PieceColor = 'white' | 'black';
export declare type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'king' | 'queen';
interface ChessPieceProps {
    color: PieceColor;
    type: PieceType;
    size?: number;
}
export declare class ChessPiece extends Component<ChessPieceProps, {}> {
    constructor(props: ChessPieceProps);
    render: () => JSX.Element;
}
export {};
