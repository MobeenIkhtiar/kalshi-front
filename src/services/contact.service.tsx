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
        console.log(`Preparing to send ${data.files.length} file(s):`);
        data.files.forEach((file, index) => {
          console.log(`  File ${index + 1}: ${file.name} (${file.size} bytes, ${file.type})`);
          formData.append('images', file); // Backend expects 'images' field name
        });
      } else {
        console.log('No files to attach');
      }

      // Use axios directly for FormData (BaseRequestService might not handle it well)
      // IMPORTANT: Don't set Content-Type manually - axios will set it automatically with boundary
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/contact`,
        formData,
        {
          headers: {
            // Let axios automatically set Content-Type with boundary for multipart/form-data
            ...(token && { Authorization: `Bearer ${token}` })
          }
        }
      );

      console.log('Contact form submitted successfully');
      return response.data;
    } catch (error: any) {
      console.error("Error submitting contact form:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      throw error;
    }
  }
}

export default new ContactService();

