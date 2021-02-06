import { ChessInstance, Square as ChessSquare } from 'chess.js';
import { Annotation, Nag } from '@zugzwang/pgn-parser/common-types';

export interface BoardMove {
  san: string,
  uci: string,
  oldFen: string,
  newFen: string,
  promotion?: PromotionPiece
}

export type PromotionPiece = "n" | "b" | "r" | "q";

export interface LineState {
  line?: SuperPly,
  pointer?: SuperPly
}

export interface SquareHighlight {
  brush: string,
  square: string,
}

export interface Shape {
  auto: boolean,
  brush: string,
  orig: string,
  dest: string
}

export type VisualIntent = 'primary' | 'success' | 'warning' | 'danger';

export interface Cues {
  shapes?: Shape[],
  intent?: VisualIntent,
  highlights?: SquareHighlight[]
}

export interface SuperPly {
  text?: string;
  annotations?: Array<Annotation>;
  nags?: Array<Nag>;
  consideredNextMoves?: Array<SuperPly>;
  nextMoveInMainLine?: SuperPly;
  previousMove?: SuperPly;
  boardMove?: BoardMove,
  visualCues?: Cues
}

const hashCode = (str: string) : number => {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
      var character = str.charCodeAt(i);
      hash = ((hash<<5)-hash)+character;
      hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
};

export class PlyInfo {

  private readonly ply : SuperPly;

  constructor(ply: SuperPly) {
    this.ply = ply;
  }
  
  get moveNumber() : number {
    return parseInt(this.ply.boardMove!.oldFen.split(' ')[5]);
  }

  get whiteMove() : boolean {
    return this.ply.boardMove!.oldFen.split(' ')[1] == 'w';
  }
  get blackMove() : boolean {
    return !this.whiteMove;
  }

  get uniqueKey() : string {
    return hashCode(this.ply.boardMove!.oldFen + this.ply.boardMove!.newFen).toString();
  }
}

export const pushMove = (boardMove: BoardMove, state: LineState) : {newState: LineState, newLine: SuperPly} => {

  var newStateObj = {};
  Object.assign(newStateObj, state);
  var newState = newStateObj as LineState;
  
  // If there is no line, set the line
  if (state.line === undefined || state.line === null) {
    var line = boardMoveToSuperPly(boardMove);
    newState.line = line;
    newState.pointer = line;
    return {
      newState: newState,
      newLine: line
    };
  }

  var pointerLine = boardMoveToSuperPly(boardMove);
  // Okay there is a line, if there is no pointer, push the move to the end of the main line
  if (state.pointer === undefined || state.pointer === null) {
    
    var pointerPly = newState.pointer!;
    if (pointerPly.consideredNextMoves === undefined || pointerPly.consideredNextMoves === null) {
      pointerPly.consideredNextMoves = [];
    }
    pointerPly.consideredNextMoves!.push(pointerLine);
    newState.pointer = pointerLine;
    pointerLine.previousMove = pointerPly!;
    return {
      newState: newState,
      newLine: pointerLine
    };
  }

  // Okay there is a line and a pointer. 
  // UNLESS the ply at the pointer already has a main line, then we add it
  // to the considered moves!

  if (newState.pointer!.nextMoveInMainLine !== undefined && newState.pointer!.nextMoveInMainLine !== null) {
    // The pointer already has a next move in main line, let's add a considered move instead
    var pointerPly = newState.pointer!;
    if (pointerPly.consideredNextMoves === undefined || pointerPly.consideredNextMoves === null) {
      pointerPly.consideredNextMoves = [];
    }
    pointerPly.consideredNextMoves!.push(pointerLine);
    newState.pointer = pointerLine;
    pointerLine.previousMove = pointerPly!;
  } else {
    // Easy, push this move to the pointer.
    newState.pointer!.nextMoveInMainLine = pointerLine;
    pointerLine.previousMove = newState.pointer!;
    newState.pointer = pointerLine;
  }
  return {
    newState: newState,
    newLine: pointerLine
  };
}

export const boardMoveToSuperPly = (m: BoardMove) : SuperPly => {
  return {
    text: m.san,
    boardMove: m,
    consideredNextMoves: []
  };
}

export const uciMoveToSanMove = (uci: string, board: ChessInstance) : string => {
  const moves = board.moves();
  var fromSquare = uci.substring(0, 2);
  var toSquare = uci.substring(2, 4);
  var promotingPiece = '';
  if (uci.length == 5) {
    promotingPiece = uci[4].toString();
  }

  const fromPiece = board.get(fromSquare as ChessSquare)!;
  if (fromPiece == null) {
    throw new Error(`No piece found at ${fromSquare} while parsing move ${uci} in position ${board.fen()}.`);
  }
  if (fromPiece.type == 'k') {
    if ((fromSquare == 'e1' && toSquare == 'g1') || (fromSquare == 'e8' && toSquare == 'g8')) {
      return 'O-O';
    } else if ((fromSquare == 'e1' && toSquare == 'c1') || (fromSquare == 'e8' && toSquare == 'c8')) {
      return 'O-O-O';
    }
  }

  var pieceFilter = fromPiece.type !== 'p' ? fromPiece.type.toUpperCase() : '';
  var areWeAPawnMove = pieceFilter === '';
  var possibleMoves = [];
  for (let m of moves) {
    if ((areWeAPawnMove || m.startsWith(pieceFilter)) && m.indexOf(toSquare) !== -1) {
      if (promotingPiece != '') {
        var promotionPortion = '=' + promotingPiece.toUpperCase();
        if (m.indexOf(promotionPortion) !== -1) {
          possibleMoves.push(m);
        }
      } else {
        var isThisAPawnMove = m[0] === m[0].toLowerCase();
        if (areWeAPawnMove == isThisAPawnMove) {
          possibleMoves.push(m);
        }
      }
    }
  }
  
  if (possibleMoves.length == 1) {
    return possibleMoves[0];
  }
  
  const fromRank = fromSquare[1];
  const fromFile = fromSquare[0];

  var finalMove = null;
  var finalMoveScore = -1;
  for (let m of possibleMoves) {
    var deAmbiguiousPart = m;
    deAmbiguiousPart.replace('x', '');
    deAmbiguiousPart.replace('+', '');
    deAmbiguiousPart.replace('#', '');
    deAmbiguiousPart = deAmbiguiousPart.split('=')[0];
    if (pieceFilter !== '') {
      deAmbiguiousPart = deAmbiguiousPart.replace(pieceFilter, '');
    }
    deAmbiguiousPart = deAmbiguiousPart.replace(toSquare, '');
    var moveRelevantScore = 0;
    if (deAmbiguiousPart.startsWith(fromFile)) moveRelevantScore++;
    if (deAmbiguiousPart.endsWith(fromRank)) moveRelevantScore++;

    if (moveRelevantScore > finalMoveScore) {
      finalMove = m;
      finalMoveScore = moveRelevantScore;
    }
  }
    
  if (finalMove === null) {
    throw new Error('No move found for uci ' + uci + '. Move was ambiguous down to ' + possibleMoves.join(',') + ' and then all moves eliminated.');
  }
  return finalMove;
}