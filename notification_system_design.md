# Notification System Design Document

## 1. Overview
This project is a production-quality frontend application built for a campus hiring evaluation. It implements a dynamic notification dashboard with a mandatory registration and authentication flow.

## 2. Architecture
The application is built using **Next.js 14+ (App Router)** with **TypeScript** and **Material UI**. It follows a modular structure to ensure maintainability and scalability.

### 2.1 Folder Structure
- `app/`: Next.js pages and layouts.
- `components/`: Reusable UI components (Notifications, Filters, Setup Forms).
- `hooks/`: Custom hooks for state and API management.
- `services/`: API interaction logic (Register, Auth, Notifications, Logs).
- `types/`: Global TypeScript definitions.
- `utils/`: Helper functions (Formatting, Sorting).
- `theme/`: Material UI theme customization.

## 3. Dynamic API Sequence
The application enforces a strictly sequential API flow to ensure security and valid data access.

1.  **Registration**: User provides academic and contact details. Returns `clientID` and `clientSecret`.
2.  **Authorization**: Automatically triggered after registration (or manually in fallback). Exchanges client credentials for a short-lived `access_token`.
3.  **Data Fetching**: The `access_token` is used in the `Authorization: Bearer <token>` header for all subsequent calls.
4.  **Logging**: Every significant event is reported to the remote log server via the logging middleware.

## 4. Features

### 4.1 Setup & Fallback
The entry point is a **Setup Flow**. It handles both new registrations and returning users. If registration fails (e.g., already registered), the user is prompted to enter their existing credentials to proceed directly to authentication.

### 4.2 Notifications Dashboard
-   **Live Fetching**: Real-time integration with the Notifications API.
-   **Pagination & Filtering**: Dynamic server-side pagination (limit/page) and type filtering.
-   **Priority Ranking**: A specialized view that sorts notifications by:
    1.  `Placement` (Highest)
    2.  `Result`
    3.  `Event` (Lowest)
    4.  Within types: Newest `Timestamp` first.
-   **Read/Unread Tracking**: Uses `localStorage` to persist viewed notification IDs locally.

### 4.3 Logging Middleware
A reusable utility that standardizes error reporting and event tracking. It ensures that API failures, UI transitions, and ranking operations are captured with consistent metadata (`stack`, `level`, `package`).

## 5. State & Persistence
-   **Auth State**: Tokens and user info are stored in `localStorage` to survive page refreshes.
-   **UI State**: React `useState` and `useEffect` manage local filtering, loading states, and pagination.

## 6. UI/UX Decisions
-   **Material UI**: Used for a professional, consistent design system.
-   **Responsive Design**: The layout adapts seamlessly from mobile to wide-screen monitors.
-   **Loading/Empty States**: Skeleton screens and descriptive empty states improve user experience during data transitions.
