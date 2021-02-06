import React from 'react'
import PropTypes from 'prop-types'
import { Chessground as NativeChessground } from 'chessground'
import { Color } from 'chessground/types';

import { Api as ChessgroundApi,  } from 'chessground/api'
import { State as ChessgroundState,  } from 'chessground/state'
import '../../styles/chessground.css';
import 'normalize.css/normalize.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import '@blueprintjs/core/lib/css/blueprint.css';

interface ChessgroundProps {
  widget: string | number | undefined;
  height: string | number | undefined;
  fen: string | undefined;
  orientation: Color | undefined;
  turnColor: Color | undefined;
}

const propTypes = {
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  fen: PropTypes.string,
  orientation: PropTypes.string,
  turnColor: PropTypes.string,
  check: PropTypes.string,
  lastMove: PropTypes.array,
  selected: PropTypes.string,
  coordinates: PropTypes.bool,
  autoCastle: PropTypes.bool,
  viewOnly: PropTypes.bool,
  disableContextMenu: PropTypes.bool,
  resizable: PropTypes.bool,
  addPieceZIndex: PropTypes.bool,
  hightlight: PropTypes.object,
  animation: PropTypes.object,
  movable: PropTypes.object,
  premovable: PropTypes.object,
  predroppable: PropTypes.object,
  draggable: PropTypes.object,
  selectable: PropTypes.object,
  onChange: PropTypes.func,
  onMove: PropTypes.func,
  onDropNewPiece: PropTypes.func,
  onSelect: PropTypes.func,
  items: PropTypes.object,
  drawable: PropTypes.object,
  style: PropTypes.object
}

export class ChessgroundWrapper extends React.Component<{},{}> {


  static defaultProps = {
    coordinates: true,
    resizable: true,
    hightlight: {
      lastMove: true,
      check: true
    }
  }

  private cg: ChessgroundApi | undefined;
  private el: any;

  buildConfigFromProps(props: any) {
    const config = { events: {} }
    Object.keys(propTypes).forEach(k => {
      const v = props[k]
      if (v) {
        const match = k.match(/^on([A-Z]\S*)/)
        if (match) {
          (config as any).events[match[1].toLowerCase()] = v
        } else {
          (config as any)[k] = v
        }
      }
    })
    return config
  }

  handleStateChanged(s: ChessgroundState) {

  }

  componentDidMount() {
    this.cg = NativeChessground(this.el, this.buildConfigFromProps(this.props));
  }

  componentWillReceiveProps(nextProps: any) {
    if (this.cg !== undefined && this.cg !== null) {
      this.cg!.set(this.buildConfigFromProps(nextProps))
    }
  }

  componentWillUnmount() {
    if (this.cg !== undefined && this.cg !== null) {
      this.cg!.destroy();
    }
  }

  render() {
    const props = { style: { ...(this.props as any).style } }
    if ((this.props as any).width) {
      props.style.width = (this.props as any).width
    }
    if ((this.props as any).height) {
      props.style.height = (this.props as any).height
    }
    return <div ref={el => this.el = el} {...props} />
  }
}