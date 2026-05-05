export type NotificationType = 'Event' | 'Result' | 'Placement';

export interface Notification {
  ID: string;
  Type: NotificationType;
  Message: string;
  Timestamp: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  mobileNo: string;
  githubUsername: string;
  rollNo: string;
  accessCode: string;
}

export interface RegisterResponse {
  clientID: string;
  clientSecret: string;
}

export interface AuthRequest {
  email: string;
  name: string;
  rollNo: string;
  accessCode: string;
  clientID: string;
  clientSecret: string;
}

export interface AuthResponse {
  token_type: string;
  access_token: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
}
