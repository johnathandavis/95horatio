import React from 'react';

import {
  PositionalClassificationTask,
  ClassificationCategory
} from './Tasks';
import ChessBoard from '../components/ChessBoard';

interface PositionClassifierState {
  categories: {
    [index: string] : boolean
  }
}

interface PositionClassifierProps {
  task: PositionalClassificationTask,
  onSubmit: (categories: ClassificationCategory[]) => void;
}

export class PositionClassifier extends React.Component<PositionClassifierProps, PositionClassifierState> {

  constructor(props: PositionClassifierProps) {
    super(props);

    var categories : {
      [name: string] : boolean
    } = {};
    props.task.categories.forEach(c => {
      categories[c.name] = false
    });

    this.state = {
      categories: categories
    }
  }

  render = () => {

    const motifBoxes : React.ReactNode[] = this.props.task.categories.map(c => {
      return (
        <>
          <input key={`${c.name}Cb`} name={`${c.name}Cb`} type='checkbox' onChange={(e) => {
            const catState = this.state.categories;
            catState[c.name] = e.currentTarget.checked;
            this.setState({categories: catState});
          }} value={c.label} />
          <label htmlFor={`${c.name}Cb`} title={c.description}>{c.label}</label>
          <br />
        </>
      );
    });
    

    return (
      <div style={{height: '100%', width: '100%', display: 'flex', flexDirection: 'row'}}>
        <div style={{flexGrow: 2}}>
          <ChessBoard
            readOnly={true}
            fen={this.props.task.initialFen}
            perspective={this.props.task.perspective} />
        </div>
        <div style={{flexGrow: 1}}>
          <h3>What motifs apply in this position?</h3>
          <br />
          {motifBoxes}
          <hr />
          <button style={{cursor: 'pointer'}} value='Submit' onClick={(_) => {
            var selectedCategories : ClassificationCategory[] = [];
            this.props.task.categories.forEach(c => {
              if (this.state.categories[c.name]) {
                selectedCategories.push(c);
              }
            });
            this.props.onSubmit(selectedCategories);
          }}>Submit</button>
        </div>
      </div>
    );

  }

}