import BaseRequestService from "./baseRequest.service";

const API_URL = import.meta.env.VITE_BACKEND_URL;

interface MarketsQueryParams {
  limit?: number;
  cursor?: string;
  event_ticker?: string;
  series_ticker?: string;
  max_close_ts?: string;
  min_close_ts?: string;
  status?: string;
  tickers?: string;
}

class MarketsService extends BaseRequestService {
  /**
   * Fetch live markets from our backend API
   */
  async getLiveMarkets(params: MarketsQueryParams = {}): Promise<any> {
    try {
      console.log("Fetching live markets from backend API...");
      
      const queryParams = new URLSearchParams();
      
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.cursor) queryParams.append('cursor', params.cursor);
      if (params.event_ticker) queryParams.append('event_ticker', params.event_ticker);
      if (params.series_ticker) queryParams.append('series_ticker', params.series_ticker);
      if (params.max_close_ts) queryParams.append('max_close_ts', params.max_close_ts);
      if (params.min_close_ts) queryParams.append('min_close_ts', params.min_close_ts);
      if (params.status) queryParams.append('status', params.status);
      if (params.tickers) queryParams.append('tickers', params.tickers);

      const url = `${API_URL}/api/kalshi/markets${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await this.get(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      }, {
        fullResponse: true,
        errorsRedirect: false
      });

      console.log("Backend API Response:", response);
      return response.data;
    } catch (error) {
      console.error("Error fetching live markets from backend:", error);
      throw error;
    }
  }

  /**
   * Test if backend API is accessible
   */
  async testBackendConnection(): Promise<boolean> {
    try {
      await this.get(`${API_URL}/api/kalshi/markets?limit=12`, {
        headers: {
          'Accept': 'application/json',
        }
      }, {
        fullResponse: true,
        errorsRedirect: false
      });
      return true;
    } catch (error) {
      console.error("Backend API connection test failed:", error);
      return false;
    }
  }
}

export default new MarketsService();
