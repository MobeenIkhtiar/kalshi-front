import BaseRequestService from './baseRequest.service';

class AuthService extends BaseRequestService {
  private baseURL = 'http://localhost:5000/api/auth';

  async register(userData: {
    username: string;
    email: string;
    password: string;
  }) {
    return this.post(`${this.baseURL}/register`, userData);
  }

  async login(credentials: {
    email: string;
    password: string;
  }) {
    return this.post(`${this.baseURL}/login`, credentials);
  }

  async getProfile() {
    const token = localStorage.getItem('token');
    return this.get(`${this.baseURL}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  async updateProfile(profileData: {
    username?: string;
    email?: string;
    kalshi_secret_key?: string;
  }) {
    const token = localStorage.getItem('token');
    return this.put(`${this.baseURL}/profile`, profileData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  async changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
  }) {
    const token = localStorage.getItem('token');
    return this.put(`${this.baseURL}/change-password`, passwordData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Utility methods
  setToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  removeToken() {
    localStorage.removeItem('token');
  }

  isAuthenticated() {
    return !!this.getToken();
  }
}

export default new AuthService();