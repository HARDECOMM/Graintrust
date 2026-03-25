# GrainTrust AI - Frontend Documentation

## 1. Frontend Architecture Overview
The frontend is built as a **Modern Single Page Application (SPA)** using React 18 and Vite. It follows a modular, component-based architecture designed for high performance, responsiveness, and a premium "Glassmorphism" aesthetic.

### Core Tech Stack
- **Framework**: React 18 (Functional Components & Hooks)
- **Build Tool**: Vite (Lightning-fast HMR and optimized production builds)
- **Routing**: React Router DOM v6 (Client-side navigation and role-based protection)
- **State Management**: React Context API (Global Auth and User state)
- **Styling**: Tailwind CSS (Utility-first CSS for rapid, consistent UI development)
- **Animations**: Motion (Framer Motion) for physics-based layout transitions
- **Icons**: Lucide React (Crisp, consistent SVG icons)
- **API Communication**: Axios (With interceptors for JWT handling)

---

## 2. Directory Structure
```text
src/
├── api/            # Axios configuration and interceptors
├── components/     # Reusable UI components (Navbar, ProtectedRoute)
├── context/        # Global state providers (AuthContext)
├── pages/          # Main page views (Dashboards, Auth, Landing)
├── App.jsx         # Root component with routing logic
├── main.tsx        # Entry point
└── index.css       # Global styles and Tailwind imports
```

---

## 3. Logical Data Flow (Step-by-Step)

### Step 1: Initialization & Persistence
When the app loads, the `AuthContext` (in `src/context/AuthContext.jsx`) executes a `useEffect` hook.
- It checks `localStorage` for a saved `user` object and `token`.
- If found, it populates the global `user` state, allowing the user to remain logged in even after a page refresh.

### Step 2: Routing & Security
The `App.jsx` file defines the application's "Map".
- **Public Routes**: `/`, `/login`, `/register`.
- **Protected Routes**: Wrapped in a `ProtectedRoute` component.
- **Role-Based Access**: The `ProtectedRoute` checks the user's `role` (farmer vs. mill). If a farmer tries to access the mill dashboard, they are redirected.

### Step 3: Authentication Flow
1. **User Input**: User fills out the Login/Register form.
2. **API Call**: The page calls the `login` or `register` function from `AuthContext`.
3. **Token Storage**: Upon a successful backend response, the JWT token is saved in `localStorage`.
4. **Interceptors**: The Axios instance in `src/api/api.js` automatically attaches this token to the `Authorization` header of every subsequent request.

### Step 4: AI & Image Processing
- **Base64 Conversion**: When a farmer uploads a field photo, the frontend converts the image to a **Base64 string** using the `FileReader` API.
- **AI Request**: This string is sent to the backend `/grains/scan-field` endpoint.
- **UI Feedback**: While waiting, the UI shows "AI Analyzing..." states using `predicting` and `visualizing` state variables.

### Step 5: Real-time Notifications
- **Polling**: The `Navbar` component runs a `setInterval` every 5 seconds.
- **Fetching**: it calls `GET /api/notifications`.
- **State Update**: The `notifications` state is updated, and the "Bell" icon shows a red badge with the unread count.

---

## 4. Component Breakdown

### Reusable Components
- **Navbar**: Handles navigation, branding, and the notification dropdown.
- **ProtectedRoute**: A higher-order component that guards sensitive pages.
- **Toaster**: (from `react-hot-toast`) Provides non-blocking "Toast" alerts for success/error feedback.

### Key Pages
- **LandingPage**: A high-impact hero section with marketing details.
- **FarmerDashboard**: 
  - **Stats**: Visual cards for active listings and revenue.
  - **Modals**: Complex forms for listing grains with AI triggers.
  - **Tabs**: Toggle between "My Listings" and "Profile/Bank Settings".
- **MillDashboard**:
  - **Marketplace**: A grid of available grains with "Fund Escrow" actions.
  - **Escrow View**: A list of active contracts with "AI Quality Scan" triggers.

---

## 5. UI/UX Design Principles
- **Glassmorphism**: Extensive use of `backdrop-blur`, semi-transparent backgrounds (`bg-white/10`), and subtle borders.
- **Feedback Loops**: Every action (listing, funding, scanning) provides immediate visual feedback via loaders or toasts.
- **Mobile-First**: Layouts use Tailwind's responsive prefixes (`md:`, `lg:`) to ensure farmers can use the tool on low-end mobile devices in the field.
- **Accessibility**: High contrast text and clear touch targets (min 44px) for interactive elements.
