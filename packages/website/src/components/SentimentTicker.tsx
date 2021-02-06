import React from 'react';
import Ticker, { FinancialTicker } from 'nice-react-ticker';

import * as apiclient from '@95horatio.johndavis.dev/api-client';

interface SentimentTrackerProps {
  alerts: apiclient.SentimentAlert[]
}

const SentimentTicker : React.FC<SentimentTrackerProps> = (p: SentimentTrackerProps) => {

  const tickerSymbols : React.ReactNode[] = p.alerts.map((alert, index) => {
    const percent = alert.Score.Positivity - alert.Score.Negativity;
    var actualPercent = Math.round(percent * 10000) / 100;
    var currentScore = alert?.Summary?.Positivity?.Value;
    var currentScoreText = '';
    if (currentScore !== undefined && currentScore !== null) {
      currentScoreText = (Math.round(currentScore! * 10000) / 100).toString();
    }
    return (
      <div style={{paddingBottom: '8px'}}>
        <FinancialTicker id={(index+1).toString()} change={actualPercent > 0} symbol={alert.TwitchUsername} lastPrice={currentScoreText} percentage={actualPercent.toString()} currentPrice="12.9" />
      </div>
    )
  });

  return (
    <Ticker>{tickerSymbols}</Ticker>

  );
}

export default SentimentTicker;