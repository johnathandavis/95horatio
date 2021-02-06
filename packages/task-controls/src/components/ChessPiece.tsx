import React, { Component } from 'react';

export type PieceColor = 'white' | 'black';
export type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'king' | 'queen';

import * as bP from '../../images/pieces/merida/bP.svg';
import * as bR from '../../images/pieces/merida/bR.svg';
import * as bN from '../../images/pieces/merida/bN.svg';
import * as bK from '../../images/pieces/merida/bK.svg';
import * as bQ from '../../images/pieces/merida/bQ.svg';
import * as bB from '../../images/pieces/merida/bB.svg';
import * as wP from '../../images/pieces/merida/wP.svg';
import * as wR from '../../images/pieces/merida/wR.svg';
import * as wN from '../../images/pieces/merida/wN.svg';
import * as wK from '../../images/pieces/merida/wK.svg';
import * as wQ from '../../images/pieces/merida/wQ.svg';
import * as wB from '../../images/pieces/merida/wB.svg';

const getImage = (color: PieceColor, type: PieceType) : any => {
  if (color === 'white') {
    switch (type) {
      case 'rook':
        return wR;
      case 'knight':
        return wN;
      case 'bishop':
        return wB;
      case 'queen':
        return wQ;
      case 'king':
        return wK;
      case 'pawn':
        return wP;
      default:
        throw new Error('Unknown piece type.');
    }
  } else {
    switch (type) {
      case 'rook':
        return bR;
      case 'knight':
        return bN;
      case 'bishop':
        return bB;
      case 'queen':
        return bQ;
      case 'king':
        return bK;
      case 'pawn':
        return bP;
      default:
        throw new Error('Unknown piece type.');
    }
  }
}

interface ChessPieceProps {
  color: PieceColor,
  type: PieceType,
  size?: number
}

export class ChessPiece extends Component<ChessPieceProps,{}> {

  constructor(props: ChessPieceProps) {
    super(props);
  }

  render = () => {
    var image = getImage(this.props.color, this.props.type);
    var width : number = 50;
    if (this.props.size !== undefined) {
      width = this.props.size!;
    }
    return (
      <img src={image} alt="" style={{ width: width }} />
    );
  }
}