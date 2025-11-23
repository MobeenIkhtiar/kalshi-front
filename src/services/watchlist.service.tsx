import BaseRequestService from "./baseRequest.service";

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

class WatchlistService extends BaseRequestService {
  /**
   * Get user's watchlist
   * GET /api/watchlist
   */
  async getWatchlist(): Promise<any> {
    try {
      const token = localStorage.getItem('token');
      
      const response = await this.get(`${API_URL}/api/watchlist`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }, {
        fullResponse: true,
        errorsRedirect: false
      });

      return response.data;
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      throw error;
    }
  }

  /**
   * Check if market is in watchlist
   * GET /api/watchlist/:ticker
   */
  async checkWatchlistStatus(ticker: string): Promise<any> {
    try {
      const token = localStorage.getItem('token');
      
      const response = await this.get(`${API_URL}/api/watchlist/${ticker}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }, {
        fullResponse: true,
        errorsRedirect: false
      });

      return response.data;
    } catch (error) {
      console.error("Error checking watchlist status:", error);
      throw error;
    }
  }

  /**
   * Add market to watchlist
   * POST /api/watchlist
   */
  async addToWatchlist(marketTicker: string): Promise<any> {
    try {
      const token = localStorage.getItem('token');
      
      const response = await this.post(
        `${API_URL}/api/watchlist`,
        { market_ticker: marketTicker },
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        },
        {
          fullResponse: true,
          errorsRedirect: false
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error adding to watchlist:", error);
      throw error;
    }
  }

  /**
   * Remove market from watchlist
   * DELETE /api/watchlist/:ticker
   */
  async removeFromWatchlist(ticker: string): Promise<any> {
    try {
      const token = localStorage.getItem('token');
      
      const response = await this.delete(
        `${API_URL}/api/watchlist/${ticker}`,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        },
        {
          fullResponse: true,
          errorsRedirect: false
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error removing from watchlist:", error);
      throw error;
    }
  }
}

export default new WatchlistService();

