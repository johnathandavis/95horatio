declare module "nice-react-ticker" {
  import { FunctionComponent } from "react";

  export interface TickerListProps {
    name?: string;
    slideSpeed?: number;
    visibleItems?: number;
    isNewsTicker?: boolean;
  }
  const TickerList: React.FunctionComponent<TickerListProps>;
  
  export interface IFinancialTrackerProps {
      id: number | string;
      symbol: string;
      change: boolean;
      identifier?: string;
      lastPrice: string;
      currentPrice: string;
      percentage: string;
  }

  export const FinancialTicker : FunctionComponent<IFinancialTrackerProps>;

  export default TickerList;
}