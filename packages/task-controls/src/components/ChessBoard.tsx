import React, { Component, MouseEvent} from "react";
import Chess, { ChessInstance, Square, ShortMove } from 'chess.js';
import { ChessgroundWrapper } from "./ChessgroundWrapper";
import { Menu, MenuItem, ContextMenu } from "@blueprintjs/core";
import { BoardMove, uciMoveToSanMove, PromotionPiece, Cues, Shape, SquareHighlight } from './BoardUtils';
import { Api as ChessgroundApi,  } from 'chessground/api'
import { State as ChessgroundState,  } from 'chessground/state'
import { Key } from 'chessground/types';
import { DrawShape } from 'chessground/draw';
import { ChessPiece, PieceColor } from './ChessPiece';

import { withSize, SizeMeProps } from 'react-sizeme';

interface ChessBoardProps {
  onMove?: (move: BoardMove) => void,
  onCuesChanged?: (newCues: Cues) => void,
  cues?: Cues,
  fen: string,
  perspective: PieceColor,
  readOnly?: boolean,
  allowMoveOtherColor?: boolean
}

interface ChessBoardState {
  lastMove: Square[] | null,
  selectVisible: boolean,
  chessWidth: number, 
  chessHeight: number
}

class ChessBoard extends Component<ChessBoardProps&SizeMeProps,ChessBoardState> {

  private pendingMove : Square[] | undefined;
  private readonly chess : ChessInstance;
  private cgRef = React.createRef<ChessgroundWrapper>();

  private mouseX : number = 0;
  private mouseY : number = 0;
  private hasBound : boolean = false;

  constructor(props: ChessBoardProps&SizeMeProps) {
    super(props);

    this.chess = (Chess as any)(props.fen);
    this.state = {
      lastMove: null,
      selectVisible: true,
      chessWidth: 100,
      chessHeight: 100,
    }
  }

  doPromotion = (piece: PromotionPiece) => {
    const { chess } = this
    const from = this.pendingMove![0]
    const to = this.pendingMove![1]
    var oldFen = chess.fen();
    var uci = from.toString().toLowerCase() + to.toString().toLowerCase() + piece;
    var san = uciMoveToSanMove(uci, this.chess);
    if (chess.move({ from, to, promotion: piece }))
    {
      this.setState({
        lastMove: [from, to],
        selectVisible: false
      });
      var newFen = chess.fen();

      var boardMove : BoardMove = {
        oldFen: oldFen,
        newFen: newFen,
        uci: uci,
        san: san
      };
      this.tryInvokeOnMove(boardMove);
    } else {
      console.log('Failed to apply promotion!');
    }
  }

  renderContextMenu() {
    // return a single element, or nothing to use default browser behavior
    return (
      <Menu>
          <MenuItem text="Queen" icon={
              <span role="presentation" onClick={() => this.doPromotion('q')}>
                <ChessPiece color='white' type='queen' />
              </span>} />
          <MenuItem text="Rook" icon={
              <span role="presentation" onClick={() => this.doPromotion('r')}>
              <ChessPiece color='white' type='rook' />
              </span>} />
          <MenuItem text="Bishop" icon={
              <span role="presentation" onClick={() => this.doPromotion('b')}>
              <ChessPiece color='white' type='bishop' />
              </span>} />
          <MenuItem text="Knight" icon={
              <span role="presentation" onClick={() => this.doPromotion('n')}>
              <ChessPiece color='white' type='knight' />
              </span>} />
      </Menu>
    );
  }

  componentDidMount()  {
    window.addEventListener("mousemove", (e: any) => this.updateMousePosition(e));
  };
  componentDidunmount()  {
    window.removeEventListener("mousemove", (e: any) => this.updateMousePosition(e));
  };

  componentDidUpdate() {
    this.drawShapes();
  }

  boardStateChanged() {

    var cgState: ChessgroundState;
    if (this.cgRef == null) return;
    var cg = (this.cgRef.current as any).cg as ChessgroundApi;
    cgState = cg.state;

    // recreate the visual cues
    var cueShapes : Shape[] = [];
    var highlights : SquareHighlight[] = [];
    var shapes = cgState.drawable.shapes;
    if (shapes !== undefined && shapes !== null) {
      shapes.forEach(shape => {
        if ('dest' in shape) {
          cueShapes.push({
            orig: shape.orig as string,
            dest: shape.dest as string,
            brush: shape.brush,
            auto: false
          });
        } else {
          highlights.push({
            square: shape.orig as string,
            brush: shape.brush
          });
        }
      });
    }
    var autoShapes = cgState.drawable.autoShapes;
    if (autoShapes !== undefined && autoShapes !== null) {
      autoShapes.forEach(shape => {
        if ('dest' in shape) {
          cueShapes.push({
            orig: shape.orig as string,
            dest: shape.dest as string,
            brush: shape.brush,
            auto: true
          });
        }
      });
    }   
    var cues : Cues = {
      shapes: cueShapes,
      highlights: highlights
    };

    if (this.props.onCuesChanged !== undefined) {
      try {
        this.props.onCuesChanged(cues);
      } catch (err) {

      }
    }
  }
  
  drawShapes() {
    if (this.cgRef == null) return;
    var cg = (this.cgRef.current as any).cg as ChessgroundApi;

    var cues = this.props.cues;

    if (cues === undefined) return;
    var autoShapes : DrawShape[] = [];
    var nonAutoShapes : DrawShape[] = [];
    var shapes : Shape[] = [];
    if (cues.shapes !== undefined && cues.shapes !== null) shapes.push(...cues.shapes!);
    
    shapes.forEach(shape => {
      if (shape.auto) {
        autoShapes.push({
          orig: shape.orig as Key,
          dest: shape.dest as Key,
          brush: shape.brush
        });
      } else {
        nonAutoShapes.push({
          orig: shape.orig as Key,
          dest: shape.dest as Key,
          brush: shape.brush
        });
      }
    });

    var highlights : SquareHighlight[] = [];
    if (cues.highlights !== undefined && cues.highlights !== null) highlights.push(...cues.highlights!);
    
    highlights.forEach(highlight => {
      nonAutoShapes.push({
        orig: highlight.square as Key,
        brush: highlight.brush
      });
    });

    cg.setAutoShapes(autoShapes);
    cg.setShapes(nonAutoShapes);
  }

  updateMousePosition(e: any) {
    var event = e as MouseEvent;
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
  }

  shouldComponentUpdate(nextProps: ChessBoardProps, nextState: ChessBoardState){
    var shouldUpdate = nextProps.fen !== this.props.fen ||
    nextState.chessWidth !== this.state.chessWidth ||
    nextState.chessHeight !== this.state.chessHeight ||
    nextProps.perspective !== this.props.perspective ||
    nextProps.cues !== this.props.cues;
    if (shouldUpdate) {
      this.chess.load(nextProps.fen);
    }
    return shouldUpdate;
  };

  calcMovable() {
    if (this.props.readOnly) {
      const dests = {} as any;
      return {
        free: false,
        dests,
        color: this.props.allowMoveOtherColor ? this.turnColor() : this.props.perspective
      }
    }

    const dests = {} as any;
    this.chess.SQUARES.forEach(s => {
      const ms = this.chess.moves({ square: s, verbose: true })
      if (ms.length) dests[s] = ms.map(m => m.to)
    })

    return {
      free: false,
      dests,
      color: this.props.allowMoveOtherColor ? this.turnColor() : this.props.perspective
    }
  }

  turnColor() {
    return this.chess.turn() === "w" ? "white" : "black"
  }
  

  onMove = (from: Square, to: Square) => {
    const { chess } = this
    const moves = chess.moves({ verbose: true })
    for (let i = 0, len = moves.length; i < len; i++) { /* eslint-disable-line */
      if (moves[i].flags.indexOf("p") !== -1 && moves[i].from === from) {
        this.pendingMove = [from, to]
        ContextMenu.show(this.renderContextMenu(), {
          top: this.mouseY,
          left: this.mouseX
        }, () => {
          console.log('Closed');
        });
        this.setState({
          selectVisible: true,
          lastMove: [from, to]
        });
      }
    }
    
    var chessMove : ShortMove = {
      from: from,
      to: to
    }

    var uci = from.toString().toLowerCase() + to.toString().toLowerCase();
    var oldFen = chess.fen();
    var san = uciMoveToSanMove(uci, chess);
    if (chess.move(chessMove)) {
      var newFen = chess.fen();
      this.setState({ lastMove: [from, to] });
      var boardMove : BoardMove = {
        oldFen: oldFen,
        newFen: newFen,
        uci: uci,
        san: san
      };
      this.tryInvokeOnMove(boardMove);
    }
  }

  render = () : React.ReactNode => {

    var size = Math.min(this.props.size.width!, this.props.size.height!);

    var props = {
      width: size,
          height: size,
          resizable: true,
          orientation: this.props.perspective,
          turnColor: this.turnColor(),
          movable: this.calcMovable(),
          lastMove: this.state.lastMove!,
          fen: this.props.fen,
          onMove: this.onMove,
          drawable: {
            onChange: () => this.boardStateChanged(),
            eraseOnClick: false
          },
          onChange: () => this.boardStateChanged(),
          style: { margin: "auto" } as any,
          ref: (el: any) => this.cgRef
    };
    const CgWrapper = React.forwardRef((props, ref) =>  <ChessgroundWrapper {...props} ref={ref as any} />);
    return <CgWrapper {...props} ref={this.cgRef} />;
  }


  private tryInvokeOnMove = (m: BoardMove) => {
    if (this.props.onMove !== null && this.props.onMove !== undefined) {
      this.props.onMove!(m);
    }
  }
}

export default withSize({
  monitorHeight: true,
  monitorWidth: true,
  noPlaceholder: false
})(ChessBoard);