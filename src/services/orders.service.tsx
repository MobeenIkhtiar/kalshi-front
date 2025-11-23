import BaseRequestService from "./baseRequest.service";

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

interface OrdersQueryParams {
  ticker?: string;
  event_ticker?: string;
  min_ts?: string;
  max_ts?: string;
  status?: string;
  limit?: number;
  cursor?: string;
}

class OrdersService extends BaseRequestService {
  /**
   * Fetch orders from the backend API
   */
  async getOrders(params: OrdersQueryParams = {}): Promise<any> {
    try {
      const token = localStorage.getItem('token');
      
      const queryParams = new URLSearchParams();
      if (params.ticker) queryParams.append('ticker', params.ticker);
      if (params.event_ticker) queryParams.append('event_ticker', params.event_ticker);
      if (params.min_ts) queryParams.append('min_ts', params.min_ts);
      if (params.max_ts) queryParams.append('max_ts', params.max_ts);
      if (params.status) queryParams.append('status', params.status);
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.cursor) queryParams.append('cursor', params.cursor);

      const url = `${API_URL}/api/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await this.get(url, {
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
      console.error("Error fetching orders from backend:", error);
      throw error;
    }
  }
}

export default new OrdersService();

