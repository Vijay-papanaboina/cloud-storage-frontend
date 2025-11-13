# Cloud Storage Frontend

A modern, responsive web application for managing cloud storage built with React, TypeScript, and Vite. This frontend application provides a user-friendly interface for uploading, managing, and organizing files in the cloud.

## Features

- 🔐 **Authentication & Authorization**

  - User registration and login
  - JWT-based authentication with automatic token refresh
  - Protected routes and session management

- 📁 **File Management**

  - Upload files to cloud storage
  - View and organize files
  - File metadata management
  - Search and filter capabilities

- 👤 **User Management**

  - User profile management
  - Settings configuration
  - API key management

- 🎨 **Modern UI/UX**
  - Responsive design with Tailwind CSS
  - Component library with Radix UI
  - Toast notifications
  - Loading states and error handling

## Tech Stack

- **Framework**: React 19.2.0
- **Language**: TypeScript 5.9.3
- **Build Tool**: Vite (Rolldown)
- **Styling**: Tailwind CSS 4.1.17
- **UI Components**: Radix UI
- **State Management**: Zustand 5.0.8
- **Routing**: React Router DOM 7.9.5
- **HTTP Client**: Axios 1.13.2
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Prerequisites

- Node.js 18+ and npm
- Backend API running (see [cloud-storage-api](../cloud-storage-api/README.md))

## Getting Started

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd cloud-storage-frontend
```

2. Install dependencies:

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

- `VITE_API_BASE_URL`: Base URL for the backend API (default: `http://localhost:8080/api`)

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the next available port).

### Build

Build for production:

```bash
npm run build
```

The production build will be in the `dist/` directory.

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

### Linting

Run ESLint to check code quality:

```bash
npm run lint
```

## Project Structure

```
cloud-storage-frontend/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable React components
│   │   ├── ui/            # UI components (buttons, cards, inputs, etc.)
│   │   ├── Layout.tsx     # Main layout component
│   │   └── ProtectedRoute.tsx  # Route protection component
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility libraries
│   │   ├── api.ts         # Axios API client configuration
│   │   ├── auth.ts        # Authentication utilities
│   │   └── utils.ts       # General utilities
│   ├── pages/             # Page components
│   │   ├── Home.tsx       # Home/Dashboard page
│   │   ├── Login.tsx      # Login page
│   │   ├── Signup.tsx     # Registration page
│   │   ├── Profile.tsx    # User profile page
│   │   └── Settings.tsx   # Settings page
│   ├── stores/            # Zustand state stores
│   │   └── authStore.ts   # Authentication state management
│   ├── App.tsx            # Main application component
│   ├── main.tsx           # Application entry point
│   └── index.css          # Global styles
├── index.html             # HTML template
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Project dependencies and scripts
```

## Key Features Implementation

### Authentication Flow

- JWT tokens stored in localStorage
- Automatic token refresh via interceptors
- Protected routes using `ProtectedRoute` component
- Session persistence with Zustand store

### API Integration

- Centralized API client in `src/lib/api.ts`
- Request/response interceptors for authentication
- Automatic token refresh on 401 errors
- Error handling and retry logic

### State Management

- Zustand for global state (authentication, user data)
- Local component state for UI-specific data
- Optimistic updates where applicable

## Development Guidelines

### Code Style

- Use TypeScript for type safety
- Follow React best practices and hooks patterns
- Use functional components with hooks
- Implement proper error boundaries
- Write accessible components (ARIA labels, keyboard navigation)

### Component Structure

- Keep components small and focused
- Extract reusable logic into custom hooks
- Use composition over inheritance
- Follow the single responsibility principle

### Styling

- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Maintain consistent spacing and typography
- Use CSS variables for theme customization

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Create a feature branch
2. Make your changes
3. Run linting: `npm run lint`
4. Test your changes
5. Submit a pull request

## License

[Add your license information here]

## Support

For issues and questions, please open an issue in the repository.
