import BaseRequestService from "./baseRequest.service";
import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

interface ContactFormData {
  name: string;
  email: string;
  message: string;
  files?: File[];
}

class ContactService extends BaseRequestService {
  /**
   * Submit contact form with optional image attachments
   * POST /api/contact (multipart/form-data)
   */
  async submitContact(data: ContactFormData): Promise<any> {
    try {
      // Create FormData for multipart/form-data
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('message', data.message);

      // Append files if any
      if (data.files && data.files.length > 0) {
        data.files.forEach((file) => {
          formData.append('images', file); // Backend expects 'images' field name
        });
      }

      // Use axios directly for FormData (BaseRequestService might not handle it well)
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/contact`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            ...(token && { Authorization: `Bearer ${token}` })
          }
        }
      );

      return response.data;
    } catch (error: any) {
      console.error("Error submitting contact form:", error);
      throw error;
    }
  }
}

export default new ContactService();

