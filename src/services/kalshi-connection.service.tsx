import BaseRequestService from './baseRequest.service';

class KalshiConnectionService extends BaseRequestService {
  private baseURL = import.meta.env.VITE_BACKEND_URL + '/api/kalshi-connection';

  async verifyConnection(kalshiAccessKeyId: string, kalshiPrivateKey: string) {
    const token = localStorage.getItem('token');
    return this.post(`${this.baseURL}/verify`, 
      { 
        kalshi_access_key_id: kalshiAccessKeyId,
        kalshi_private_key: kalshiPrivateKey
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  }

  async getConnectionStatus() {
    const token = localStorage.getItem('token');
    return this.get(`${this.baseURL}/status`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  async disconnect() {
    const token = localStorage.getItem('token');
    return this.delete(`${this.baseURL}/disconnect`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  async getBalance() {
    const token = localStorage.getItem('token');
    return this.get(`${this.baseURL}/balance`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  async getCredentials() {
    const token = localStorage.getItem('token');
    return this.get(`${this.baseURL}/credentials`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
}

export default new KalshiConnectionService();
