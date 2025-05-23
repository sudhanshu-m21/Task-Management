# Task Management System

A full-stack web application for task management with user authentication, CRUD operations, file uploads, and more.

## Features

- User authentication with JWT
- User management (admin only)
- Task creation, reading, updating, and deletion
- Task assignment to users
- File attachments (PDF documents)
- Filtering and sorting tasks
- Responsive UI with Tailwind CSS
- Containerized with Docker

## Tech Stack

- **Frontend**: React, React Router, Context API, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT
- **File Storage**: Local file system (configurable for cloud storage)
- **Containerization**: Docker

## Prerequisites

- Node.js (v14+)
- MongoDB
- Docker and Docker Compose (for containerized deployment)

## Getting Started

### Using Docker (Recommended)

1. Clone the repository:
   \`\`\`
   git clone https://github.com/yourusername/task-management-system.git
   cd task-management-system
   \`\`\`

2. Create a `.env` file in the backend directory (copy from `.env.example`):
   \`\`\`
   cp backend/.env.example backend/.env
   \`\`\`

3. Start the application using Docker Compose:
   \`\`\`
   docker-compose up
   \`\`\`

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Manual Setup

#### Backend

1. Navigate to the backend directory:
   \`\`\`
   cd backend
   \`\`\`

2. Install dependencies:
   \`\`\`
   npm install
   \`\`\`

3. Create a `.env` file (copy from `.env.example`):
   \`\`\`
   cp .env.example .env
   \`\`\`

4. Start the server:
   \`\`\`
   npm run dev
   \`\`\`

#### Frontend

1. Navigate to the frontend directory:
   \`\`\`
   cd frontend
   \`\`\`

2. Install dependencies:
   \`\`\`
   npm install
   \`\`\`

3. Start the development server:
   \`\`\`
   npm start
   \`\`\`

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### User Endpoints

- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID (admin only)
- `GET /api/users/me` - Get current user
- `POST /api/users` - Create a new user (admin only)
- `PUT /api/users/:id` - Update user (admin only)
- `PUT /api/users/me` - Update current user profile
- `DELETE /api/users/:id` - Delete user (admin only)

### Task Endpoints

- `GET /api/tasks` - Get all tasks with filtering and sorting
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/:id/documents/:docId` - Get task document
- `DELETE /api/tasks/:id/documents/:docId` - Delete task document

## Testing

The application includes unit and integration tests for both frontend and backend components.

### Running Backend Tests

\`\`\`
cd backend
npm test
\`\`\`

### Running Frontend Tests

\`\`\`
cd frontend
npm test
\`\`\`

## Project Structure

\`\`\`
task-management-system/
├── backend/                # Backend Node.js/Express application
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── utils/              # Utility functions
│   ├── uploads/            # File uploads directory
│   ├── .env.example        # Environment variables example
│   ├── package.json        # Backend dependencies
│   └── server.js           # Entry point
├── frontend/               # Frontend React application
│   ├── public/             # Static files
│   ├── src/                # React source files
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # Context API providers
│   │   ├── pages/          # Page components
│   │   ├── utils/          # Utility functions
│   │   ├── App.jsx         # Main App component
│   │   └── index.jsx       # Entry point
│   └── package.json        # Frontend dependencies
├── Dockerfile.frontend     # Frontend Docker configuration
├── Dockerfile.backend      # Backend Docker configuration
├── docker-compose.yml      # Docker Compose configuration
└── README.md               # Project documentation
\`\`\`

## Security Considerations

- Password hashing with bcrypt
- JWT-based authentication
- Role-based access control
- Input validation
- Error handling
- CORS configuration

## Deployment

The application can be deployed to various cloud platforms:

### Heroku

1. Create a new Heroku app
2. Set up MongoDB Atlas for database
3. Configure environment variables in Heroku
4. Deploy using Heroku CLI or GitHub integration

### AWS

1. Set up EC2 instances or ECS clusters
2. Configure MongoDB on Atlas or DocumentDB
3. Set up load balancing and auto-scaling
4. Deploy using Docker images

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [React](https://reactjs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Docker](https://www.docker.com/)
