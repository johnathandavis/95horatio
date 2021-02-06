

declare module "react-chessground" {
  import { Component } from "react";

  export class Chessground extends Component<ChessgroundProps & React.HTMLAttributes<any>, {}> {
    constructor(props: ChessgroundProps);

    render(): JSX.Element;
  }

  export interface ChessgroundProps {

    width?: string | number;
    height?: string | number;
    fen?: string;
    orientation?: string;
    turnColor?: string;
    check?: string;
    lastMove?: any[];
    scoreUser?: any[];
    selected?: string;
    coordinates?: boolean;
    autoCastle?: boolean;
    viewOnly?: boolean;
    disableContextMenu?: boolean;
    resizable?: boolean;
    addPieceZIndex?: boolean;
    highlight?: any;
    animation?: any;
    movable?: any;
    premovable?: any;
    predroppable?: any;
    draggable?: any;
    selectable?: any;
    onChange?: any;
    onMove?: any;
    onDropNewPiece?: any;
    onSelect?: any;
    items?: any;
    drawable?: any;
  }

}