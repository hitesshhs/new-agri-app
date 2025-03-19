# HarvestMind Platform

## Project Overview
HarvestMind is a task management platform built with Flask and Supabase, featuring user authentication, task management, and profile management capabilities.

## Project Structure
```
harvestmind-platform/
├── python_version/
│   ├── app.py (Main Flask Application)
│   ├── auth.py (Authentication Module)
│   ├── supabase_client.py (Database Client)
│   ├── templates/ (Frontend Templates)
│   │   ├── index.html (Landing Page)
│   │   ├── dashboard.html (User Dashboard)
│   │   └── profile.html (User Profile)
│   └── static/
│       ├── js/
│       │   ├── auth.js (Authentication Logic)
│       │   └── dashboard.js (Dashboard Logic)
│       └── css/
│           └── styles.css (Styling)
```

## Implementation Details

### 1. Authentication Flow (auth.py)
```pseudocode
# User Registration
function register_user(email, password, username):
    try:
        # 1. Create user in Supabase Auth
        auth_response = supabase.auth.sign_up(email, password)
        
        # 2. If successful, create user profile
        if auth_response.success:
            profile_data = {
                id: auth_response.user.id,
                username: username,
                email: email,
                created_at: current_timestamp
            }
            # Store profile in Supabase database
            supabase.table('profiles').insert(profile_data)
            return success_response
        else:
            return error_response
    catch error:
        return error_response

# User Login
function login_user(email, password):
    try:
        # 1. Authenticate with Supabase
        auth_response = supabase.auth.sign_in(email, password)
        
        # 2. If successful, create session
        if auth_response.success:
            session.user_id = auth_response.user.id
            session.email = auth_response.user.email
            return success_response
        else:
            return error_response
    catch error:
        return error_response

# Session Management
function get_current_user():
    # 1. Check if user is logged in
    if session.user_id exists:
        # 2. Get user profile from database
        profile = supabase.table('profiles').get(session.user_id)
        return profile
    return null
```

### 2. Main Application Flow (app.py)
```pseudocode
# Initialize Application
app = Flask()
app.secret_key = environment_variable
CORS(app)

# Authentication Routes
route /api/auth/register:
    method: POST
    data = request.json
    result = register_user(data.email, data.password, data.username)
    return result

route /api/auth/login:
    method: POST
    data = request.json
    result = login_user(data.email, data.password)
    return result

# Protected Routes (require authentication)
route /dashboard:
    decorator: @login_required
    return render_template('dashboard.html')

# Task Management
route /api/tasks:
    method: GET
    decorator: @login_required
    try:
        # Get tasks from Supabase
        tasks = supabase.table('tasks').get(user_id)
        return tasks
    catch error:
        # Fallback to sample data
        return sample_tasks

route /api/tasks:
    method: POST
    decorator: @login_required
    data = request.json
    # Create new task
    task = supabase.table('tasks').insert(data)
    return task
```

### 3. Database Schema (Supabase)
```pseudocode
# Tables Structure
table profiles:
    id: uuid (primary key)
    username: string
    email: string
    created_at: timestamp

table tasks:
    id: uuid (primary key)
    user_id: uuid (foreign key -> profiles.id)
    title: string
    completed: boolean
    created_at: timestamp
    updated_at: timestamp
```

### 4. Frontend Flow
```pseudocode
# Authentication Flow (auth.js)
function handleLogin():
    # 1. Get form data
    email = loginForm.email
    password = loginForm.password
    
    # 2. Send to backend
    response = fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({email, password})
    })
    
    # 3. Handle response
    if response.success:
        redirect to dashboard
    else:
        show error message

# Dashboard Flow (dashboard.js)
function loadTasks():
    # 1. Fetch tasks from backend
    response = fetch('/api/tasks')
    
    # 2. Update UI
    if response.success:
        displayTasks(response.data)
    else:
        show error message

function createTask():
    # 1. Get form data
    taskData = taskForm.data
    
    # 2. Send to backend
    response = fetch('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData)
    })
    
    # 3. Update UI
    if response.success:
        addTaskToList(response.data)
    else:
        show error message
```

### 5. Security Features
```pseudocode
# Session Protection
decorator login_required:
    function check_auth():
        if session.user_id exists:
            return true
        return false

# API Security
- All sensitive routes use @login_required decorator
- CORS enabled for frontend-backend communication
- Environment variables for sensitive data
- Secure session management
```

### 6. Error Handling
```pseudocode
# Backend Error Handling
try:
    # Database operations
    response = supabase.operation()
catch error:
    # Log error
    log_error(error)
    # Return appropriate error response
    return error_response

# Frontend Error Handling
function handleApiError(error):
    # Display user-friendly error message
    showErrorMessage(error.message)
    # Log error for debugging
    console.error(error)
```

## Implementation Overview
The HarvestMind platform implements a modern web application architecture with the following key features:

1. **Authentication System**: Secure user registration and login using Supabase Auth
2. **Task Management**: CRUD operations for tasks with real-time updates
3. **User Profiles**: User profile management with customizable settings
4. **Security**: Protected routes, secure session management, and CORS support
5. **Error Handling**: Comprehensive error handling with fallback mechanisms
6. **Frontend-Backend Integration**: Seamless communication between frontend and backend

The application follows best practices for web development, including:
- Separation of concerns
- Secure authentication
- Responsive design
- Error handling
- Session management
- Database integration

## Getting Started
1. Clone the repository
2. Install dependencies: `pip install -r requirements.txt`
3. Set up environment variables in `.env`
4. Run the application: `python app.py`
5. Access the application at `http://localhost:5000`

## About

HarvestMind is a comprehensive task management system that allows users to create, manage, and track tasks. The platform features user authentication, profile management, and secure data storage with Supabase.

## Python Implementation

This project uses a Python/Flask implementation with the following features:

- User Authentication (signup, login, logout)
- Task Management System with CRUD operations
- User Profile Management
- RESTful API
- Mobile-responsive design
- Cloud database with Supabase

## Getting Started

1. Navigate to the Python version directory:
```bash
cd python_version
```

2. Follow the instructions in the Python version README or the CONNECT_TO_YOUR_SUPABASE.md guide.

## Cleaning Up Original Code

If you want to remove the original web implementation files, you can run the provided cleanup script:

```powershell
# On Windows
.\cleanup.ps1
```

This will remove all the TypeScript/React implementation files, leaving only the Python implementation.

# Welcome to your  project

## Project info

**URL**: https://lovable.dev/projects/8c2740d7-bf29-4bc2-bb9a-46cfa58f2e2a

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/8c2740d7-bf29-4bc2-bb9a-46cfa58f2e2a) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

