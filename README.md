# Engineering Resource Management System

A web application for managing engineering resources, project assignments, and team capacity planning. Built with modern technologies to provide an intuitive interface for resource managers and engineers to collaborate effectively.

## Features

### For Managers

- **Project Management**: Create, and track projects
- **Resource Allocation**: Assign engineers to projects with skill-based matching
- **Assignment Tracking**: View and manage all project assignments with timeline tracking

### For Engineers

- **Profile Management**: Update personal information, skills, and availability
- **Capacity Monitoring**: Track personal workload and capacity utilization
- **Project Details**: Access project information and requirements

### Frontend

- **React 19** with TypeScript
- **Vite** for development and building
- **Tailwind CSS** for styling
- **React Hook Form** for form implementation
- **Axios** for HTTP client
- **React Router** for navigation

### Backend

- **Node.js** with Express.js framework
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcryptjs** for password hashing

### 1. Backend Setup

```bash
# Navigate to backend directory
cd Backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

#### Configure Backend Environment Variables

Create a `.env` file in the `Backend` directory with the following variables:

```env
# MongoDB Connection String
MONGO_URI=mongodb://localhost:27017/engineering-resource-management
# JWT Configuration
JWT_SECRET=jwt-key
JWT_LIFETIME=1h

# Server Configuration
PORT=5000
```

#### Start Backend Server

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The backend server will start on `http://localhost:5000`

### 2. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd Frontend

# Install dependencies
npm install

```

#### Configure Frontend Environment Variables

Create a `.env` file in the `Frontend` directory with the following variables:

```env
# API Base URL for the backend server
VITE_APP_API_BASE_URL=http://localhost:5000
```

#### Start Frontend Development Server

```bash
# Development mode
npm run dev

# Build for production
npm run build

The frontend application will start on `http://localhost:5173`

## 📁 Project Structure

```

engineerResourceManager/
├── Backend/ # Node.js/Express backend
│ ├── controllers/ # Request handlers
│ ├── db/ # Database connection
│ ├── errors/ # Custom error classes
│ ├── middleware/ # Express middleware
│ ├── models/ # MongoDB schemas
│ ├── router/ # API routes
│ ├── app.js # Main server file
│ └── package.json
├── Frontend/ # React/TypeScript frontend
│ ├── src/
│ │ ├── components/ # Reusable UI components
│ │ ├── context/ # React context providers
│ │ ├── hooks/ # Custom React hooks
│ │ ├── pages/ # Page components
│ │ ├── services/ # API service functions
│ │ └── lib/ # Utility functions
│ ├── public/ # Static assets
│ └── package.json
└── README.md

### Full Stack Application Development with AI Tools

I used AI tools like ChatGPT and Cursor IDE to create this full stack application. Here's the breakdown of the development process:

#### Backend Development

1. **Backend Framework & Database**:
   - I started by creating the backend using Node.js, Express, and Mongoose, using my old projects as a reference to save time.
2. **User Routes & Controllers**:
   - Created **user register**, **login**, and **profile** routes with their respective controllers.
3. **Authentication Middleware**:

   - Developed **user authentication middleware** from scratch.

4. **Mongoose Schema & Models**:

   - Created the **user schema** and **models** using Mongoose.
   - Utilized ChatGPT to help design the schema and models for the **project** and **assignment** with the required fields.
   - Adapted and modified the generated code to fit into my project’s needs.

5. **Error Handling**:
   - Developed functions to handle errors in the backend efficiently.

#### Frontend Development

1. **Frontend Framework & Setup**:

   - Created a **Vite+TypeScript** project to set up the frontend.
   - Implemented basic **routing** using `react-router-dom`.
   - Installed necessary dependencies such as **Tailwind CSS** and **shadCN UI components**.

2. **UI Components**:

   - Designed and created basic **login** and **register** pages using **shadCN UI components**.

3. **Controllers & CRUD Operations**:
   - Used **Cursor IDE** to create various pages and the controllers required to handle CRUD operations on the frontend.

#### Iterations & Debugging

- After many iterations and debugging, I was able to complete the project.
- AI tools assisted greatly in completing the project on time, but I had to manually resolve multiple **CSS bugs** and **JavaScript errors** along the way.

#### Conclusion

AI tools were incredibly helpful in speeding up development, but they also required me to manually fix issues that arose during the process. Despite some setbacks, the project was completed successfully within the given deadline.

## Test login credentials

email/password - role

```bash
jas@gmailcom/jaswanth123 - manager
venky@gmail.com/venky123 - engineer
bala@gmail.com/bala1234 - engineer
gopi@gmail.com/gopi1234 - engineer
john@gmail.com/john1234 - engineer
```

