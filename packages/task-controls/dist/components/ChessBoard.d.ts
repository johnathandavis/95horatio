import React from "react";
import { BoardMove, Cues } from './BoardUtils';
import { PieceColor } from './ChessPiece';
import { SizeMeProps } from 'react-sizeme';
interface ChessBoardProps {
    onMove?: (move: BoardMove) => void;
    onCuesChanged?: (newCues: Cues) => void;
    cues?: Cues;
    fen: string;
    perspective: PieceColor;
    readOnly?: boolean;
    allowMoveOtherColor?: boolean;
}
declare const _default: React.ComponentType<Pick<ChessBoardProps & SizeMeProps, "onMove" | "onCuesChanged" | "cues" | "fen" | "perspective" | "readOnly" | "allowMoveOtherColor"> & import("react-sizeme").WithSizeProps>;
export default _default;
