# Notification Frontend App

This is a production-quality Next.js application built for the campus hiring evaluation.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Library**: Material UI (MUI)
- **Icons**: MUI Icons
- **State**: React Hooks + LocalStorage for persistence

## Features
1. **Dynamic Setup Flow**: Handles registration and authentication sequentially.
2. **Fallback Auth**: Allows returning users to authenticate directly if already registered.
3. **Notification Dashboard**: 
   - Server-side pagination and filtering.
   - Real-time API integration.
   - Read/Unread tracking with local persistence.
4. **Priority Board**: Custom ranking logic based on notification types and timestamps.
5. **Logging Middleware**: Centralized logging for all app events and errors.

## Installation & Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

## API Flow
1. **Register**: `POST /register` -> returns clientID/clientSecret.
2. **Auth**: `POST /auth` (with clientID/clientSecret) -> returns access_token.
3. **Protected Routes**: All subsequent calls use `Authorization: Bearer <access_token>`.
