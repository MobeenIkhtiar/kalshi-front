// Kalshi API Response Interfaces

export interface KalshiMarket {
  ticker: string;
  event_ticker: string;
  market_type: string;
  title: string;
  subtitle: string;
  yes_sub_title: string;
  no_sub_title: string;
  open_time: string;
  close_time: string;
  expiration_time: string;
  latest_expiration_time: string;
  settlement_timer_seconds: number;
  status: string;
  response_price_units: string;
  notional_value: number;
  notional_value_dollars: string;
  tick_size: number;
  yes_bid: number;
  yes_bid_dollars: string;
  yes_ask: number;
  yes_ask_dollars: string;
  no_bid: number;
  no_bid_dollars: string;
  no_ask: number;
  no_ask_dollars: string;
  last_price: number;
  last_price_dollars: string;
  previous_yes_bid: number;
  previous_yes_bid_dollars: string;
  previous_yes_ask: number;
  previous_yes_ask_dollars: string;
  previous_price: number;
  previous_price_dollars: string;
  volume: number;
  volume_24h: number;
  liquidity: number;
  liquidity_dollars: string;
  open_interest: number;
  result: string;
  can_close_early: boolean;
  expiration_value: string;
  category: string;
  risk_limit_cents: number;
  rules_primary: string;
  rules_secondary: string;
  settlement_value: number;
  settlement_value_dollars: string;
  price_level_structure: string;
  price_ranges: Array<{
    start: string;
    end: string;
    step: string;
  }>;
}

export interface KalshiMarketsResponse {
  cursor: string;
  markets: KalshiMarket[];
}

export interface KalshiOrder {
  order_id: string;
  user_id: string;
  client_order_id?: string;
  ticker: string;
  side: 'yes' | 'no';
  action: 'buy' | 'sell';
  type: string;
  status: string;
  yes_price: number;
  no_price: number;
  yes_price_dollars: string;
  no_price_dollars: string;
  fill_count: number;
  remaining_count: number;
  initial_count: number;
  taker_fees: number;
  maker_fees: number;
  taker_fill_cost: number;
  maker_fill_cost: number;
  taker_fill_cost_dollars: string;
  maker_fill_cost_dollars: string;
  queue_position?: number;
  taker_fees_dollars: string;
  maker_fees_dollars: string;
  expiration_time: string;
  created_time: string;
  last_update_time: string;
  self_trade_prevention_type?: string;
  order_group_id?: string;
  cancel_order_on_pause?: boolean;
}

export interface KalshiOrdersResponse {
  orders: KalshiOrder[];
  cursor: string | null;
}

// Helper function to transform Kalshi market data to our MarketCard format
export const transformKalshiMarket = (market: KalshiMarket) => {
  // Calculate ROI based on price change
  const currentPrice = parseFloat(market.last_price_dollars);
  const previousPrice = parseFloat(market.previous_price_dollars);
  const roi = previousPrice > 0 ? ((currentPrice - previousPrice) / previousPrice) * 100 : 0;
  
  // Determine sentiment based on price movement
  const sentiment = roi > 0 ? 'Bullish' : 'Bearish';
  
  return {
    question: market.title,
    category: market.category || 'General',
    price: `$${market.last_price_dollars}`,
    roi: `${roi >= 0 ? '+' : ''}${roi.toFixed(1)}%`,
    volume: `${(market.volume_24h / 1000).toFixed(1)}K`,
    probability: `${(currentPrice * 100).toFixed(0)}%`,
    sentiment: sentiment as 'Bullish' | 'Bearish'
  };
};
