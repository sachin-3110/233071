import {
  RegisterRequest,
  RegisterResponse,
  AuthRequest,
  AuthResponse,
  Notification,
} from '@/types';

const BASE_URL = '/api';

/**
 * Service for handling all API interactions with the evaluation service.
 */
export const ApiService = {
  /**
   * Registers a new user.
   */
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Registration failed');
    }

    return response.json();
  },

  /**
   * Authorizes the user and returns an access token.
   */
  auth: async (data: AuthRequest): Promise<AuthResponse> => {
    const response = await fetch(`${BASE_URL}/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorMessage = 'Authorization failed';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || JSON.stringify(errorData);
      } catch {
        errorMessage = await response.text();
      }
      throw new Error(errorMessage);
    }

    return response.json();
  },

  /**
   * Fetches notifications with pagination and filtering.
   */
  getNotifications: async (params: {
    limit?: number;
    page?: number;
    notification_type?: string;
    token: string;
  }): Promise<Notification[]> => {
    const { limit, page, notification_type, token } = params;
    const url = new URL(`${BASE_URL}/notifications`);
    
    if (limit) url.searchParams.append('limit', limit.toString());
    if (page) url.searchParams.append('page', page.toString());
    if (notification_type && notification_type !== 'All') {
      url.searchParams.append('notification_type', notification_type);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to fetch notifications');
    }

    return response.json();
  },

  /**
   * Sends logs to the evaluation service.
   */
  sendLog: async (data: {
    stack: string;
    level: string;
    package: string;
    message: string;
    token: string;
  }): Promise<void> => {
    const { token, ...payload } = data;
    await fetch(`${BASE_URL}/logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  },
};
