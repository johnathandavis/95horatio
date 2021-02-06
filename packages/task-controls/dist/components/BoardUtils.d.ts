import { ChessInstance } from 'chess.js';
import { Annotation, Nag } from '@zugzwang/pgn-parser/common-types';
export interface BoardMove {
    san: string;
    uci: string;
    oldFen: string;
    newFen: string;
    promotion?: PromotionPiece;
}
export declare type PromotionPiece = "n" | "b" | "r" | "q";
export interface LineState {
    line?: SuperPly;
    pointer?: SuperPly;
}
export interface SquareHighlight {
    brush: string;
    square: string;
}
export interface Shape {
    auto: boolean;
    brush: string;
    orig: string;
    dest: string;
}
export declare type VisualIntent = 'primary' | 'success' | 'warning' | 'danger';
export interface Cues {
    shapes?: Shape[];
    intent?: VisualIntent;
    highlights?: SquareHighlight[];
}
export interface SuperPly {
    text?: string;
    annotations?: Array<Annotation>;
    nags?: Array<Nag>;
    consideredNextMoves?: Array<SuperPly>;
    nextMoveInMainLine?: SuperPly;
    previousMove?: SuperPly;
    boardMove?: BoardMove;
    visualCues?: Cues;
}
export declare class PlyInfo {
    private readonly ply;
    constructor(ply: SuperPly);
    get moveNumber(): number;
    get whiteMove(): boolean;
    get blackMove(): boolean;
    get uniqueKey(): string;
}
export declare const pushMove: (boardMove: BoardMove, state: LineState) => {
    newState: LineState;
    newLine: SuperPly;
};
export declare const boardMoveToSuperPly: (m: BoardMove) => SuperPly;
export declare const uciMoveToSanMove: (uci: string, board: ChessInstance) => string;
