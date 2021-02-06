import React from 'react';
import {
  PageHeader, Layout
} from 'antd';

import { PositionClassifier, PositionalClassificationTask } from '@95horatio.johndavis.dev/task-controls';

const task : PositionalClassificationTask = {
  initialFen: 'r2qk2r/pp2bppp/2n1bn2/3P4/2P2p2/5N2/PP4PP/RNBQKB1R b KQkq - 0 9',
  categories: [
    {
      name: 'fork',
      label: 'Fork',
      description: 'Attacking two pieces at once'
    },
    {
      name: 'skewer',
      label: 'Skewer',
      description: 'Attacking a piece through another piece.'
    }
  ],
  perspective: 'white'
}

export default function Tasks() {

  return (
    <div className="site-page-header-ghost-wrapper" style={{width: '100%', height: '100%'}}>
      <Layout style={{width: '100%', height: '100%'}}>
        <PageHeader
          className="site-page-header"
          onBack={() => null}
          title="Tasks"
          subTitle="Finish your tasks"
        />
          <div className="site-card-wrapper" style={{width: '100%', height: '100%'}}>
            <PositionClassifier task={task} onSubmit={(categories => console.log(categories))} />
          </div>
      </Layout>
    </div>
  );
}