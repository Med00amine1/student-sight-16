
# Course Platform Backend

This is a Flask backend for a course platform similar to Udemy. It provides all the necessary API endpoints for the frontend to interact with.

## Features

- User authentication (register, login, logout)
- Course management
- Enrollment system
- Quiz functionality
- Progress tracking
- Search functionality
- Payment processing (mock implementation)
- Teacher dashboard with metrics

## Prerequisites

- Python 3.7 or higher
- Flask

## Installation

1. Clone the repository
2. Create a virtual environment:
   ```
   python -m venv env
   ```
3. Activate the virtual environment:
   - On Windows:
     ```
     .\env\Scripts\activate
     ```
   - On macOS/Linux:
     ```
     source env/bin/activate
     ```
4. Install the required packages:
   ```
   pip install flask flask-cors werkzeug
   ```

## Running the Application

1. Run the Flask application:
   ```
   python app.py
   ```
2. The API will be available at `http://localhost:5000`

## Demo Users

The following demo users are created automatically:

1. Teacher account:
   - Email: admin@example.com
   - Password: admin123

2. Student account:
   - Email: student@example.com
   - Password: student123

## API Documentation

### Authentication Endpoints

- **POST /api/auth/register** - Register a new user
- **POST /api/auth/login** - Login an existing user
- **POST /api/auth/logout** - Logout the current user
- **GET /api/auth/me** - Get the current user's information
- **POST /api/auth/switch-mode** - Switch between student and teacher modes

### Course Endpoints

- **GET /api/courses** - Get all courses
- **GET /api/courses/:id** - Get a course by ID
- **POST /api/courses** - Create a new course
- **PUT /api/courses/:id** - Update a course
- **DELETE /api/courses/:id** - Delete a course
- **POST /api/courses/:id/enroll** - Enroll in a course
- **GET /api/courses/purchased** - Get all purchased courses

### Course Content and Progress Endpoints

- **GET /api/courses/:id/content** - Get course content
- **GET /api/courses/:id/progress** - Get course progress
- **POST /api/courses/:id/complete-lecture** - Mark a lecture as completed
- **POST /api/courses/:id/save-notes** - Save notes for a lecture
- **POST /api/courses/:id/ask-question** - Ask a question about a lecture
- **POST /api/courses/:id/submit-quiz** - Submit quiz answers
- **POST /api/courses/:id/track-progress** - Track video progress
- **GET /api/courses/:id/certificate** - Get a course completion certificate

### Catalog and Search Endpoints

- **GET /api/catalog/courses** - Get all catalog courses
- **GET /api/catalog/search** - Search for courses
- **GET /api/catalog/featured** - Get featured courses
- **GET /api/catalog/recommended** - Get recommended courses

### Teacher Dashboard Endpoints

- **GET /api/courses/instructor** - Get all courses by the current instructor
- **GET /api/courses/:id/students** - Get all students enrolled in a course
- **GET /api/metrics** - Get teacher metrics

### Payment Endpoints

- **POST /api/payment/create-checkout-session** - Create a new checkout session

## Data Storage

Data is stored in JSON files in the `data` directory:

- `users.json` - User information
- `courses.json` - Course information
- `enrollments.json` - Enrollment information
- `progress.json` - Course progress information
