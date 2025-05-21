# Recipe Management Comparison

This project aims to compare **React** and **Angular** frameworks by developing a recipe management web application with shared backend services. The comparison is based on metrics like learning curve, development complexity, performance, and user experience.

## Version
Current version: v3.0.0

## Project Overview

The repository contains:
- A **backend** built with **Node.js** for user authentication, favorite recipes, and reviews.
- Two frontend applications: one using **React** and the other using **Angular**, both offering identical features for fair comparison.
- A set of **shared styles** to ensure consistent design between the applications.

## Repository Structure

```plaintext
recipe-management-comparison/
│
├── backend/             # Backend services (Node.js, Express.js)
│   └── ...              # API implementation, database setup, etc.
│
├── frontend-react/      # Recipe management app built with React
│   └── ...              # React components, hooks, and state management
│
├── frontend-angular/    # Recipe management app built with Angular
│   └── ...              # Angular components, modules, and services
│
├── shared-styles/       # Shared CSS styles for consistent design
│   ├── assets/          # Images, icons, and other assets
│   ├── html/            # HTML templates for testing shared styles
│   └── styles/          # SCSS styles used by both React and Angular apps
│       ├── components/  # Component-specific styles
│       ├── pages/       # Page-specific styles
│       └── main.scss    # Base styles and imports
│
└── README.md            # Project documentation

```

### Backend Structure

```plaintext
backend/
├── .env                      # Environment variables (e.g., PORT, MONGO_URI, JWT_SECRET)
├── .eslintrc.json            # ESLint configuration file to enforce code quality and style
├── .gitignore                # Specifies files and folders that Git should ignore
├── .prettierrc               # Prettier configuration file for consistent code formatting
├── Dockerfile                # Instructions to build the Docker container image for the backend
├── docker-compose.yml        # Orchestrates containers (backend application and MongoDB instance)
├── package.json              # Project metadata, dependencies, scripts, and configuration
├── tsconfig.json             # TypeScript compiler configuration and import alias definitions
└── src/                      # Source code of the project
   ├── application            # Contains business logic, services, and use cases (application layer)
   ├── domain                 # Core domain models, entities, and ports (interfaces/contracts)
   ├── infrastructure         # Infrastructure code (database config, repositories, and external integrations)
   ├── interfaces             # HTTP controllers and route definitions for exposing the API
   ├── shared                 # Reusable components (DTOs, mappers, middlewares, error classes, etc.)
   ├── swagger                # API documentation files in Swagger/OpenAPI format
   └── tests                  # Test suite, including unit tests and integration tests
```

## Features

Both frontend applications include:
- User Authentication: Secure login and signup.
- Recipe Search: Search and filter recipes using an external API.
- Favorites Management: Save favorite recipes to a database.
- User Reviews: Add and view reviews for recipes.
- Comparison Metrics

## Comparison Metrics

This project compares React and Angular based on:
1. Learning Curve: Ease of learning for each framework.
2. Development Complexity: Time and effort required to implement similar features.
3. Performance: Loading speed, responsiveness, and efficiency.
4. User Experience: Usability and design consistency.
5. Integration: Ease of connecting to the backend and external APIs.

## Development Setup
### Prerequisites
- Node.js (v18+)
- npm or yarn
- Code editor (e.g., VS Code)

### Initial Setup

1. Clone the repository:
   ```bash
   git clone
    ```

2. Install dependencies for the backend

    ```bash
    cd backend
    npm install
    npm install nodemon --save-dev
    ```

3. Install dependencies for the React frontend

    ```bash
    cd frontend-react
    npm install
    ```

4. Install dependencies for the Angular frontend

    ```bash
    cd frontend-angular
    npm install
    ```

5. Start the backend server

    ```bash
    cd backend
    npm start 
    or
    npm run dev
    ```

6. Accessing API Documentation

    ```bash
    http://localhost:3000/api-docs
    ```

7. Start the React frontend

    ```bash
    cd frontend-react
    npm start
    ```

8. Start the Angular frontend

    ```bash
    cd frontend-angular
    npm start
    ```

### Shared Styles
The shared-styles/styles.css file contains common classes and variables. Both React and Angular apps import this file to ensure a consistent look and feel.
To test styles independently:

1. Install sass globally if you haven't already:

   ```bash
   npm install -g sass 
   ```

2. Compile the SCSS to CSS:

   ```bash
   cd shared-styles/styles 
   sass main.scss main.css
   ```

3. Open the shared-styles/html/index.html file in a browser to see the styles applied.

### Docker Setup

1. Build the backend image inside the backend folder:

    ```bash
    docker-compose build
    docker-compose up -d
    ```
   
2. Build and run the React frontend using Docker:

    ```bash
    docker build -t frontend-react -f frontend-react/Dockerfile .
    docker run -p 8080:8080 frontend-react
    ```

3. Build and run the Angular frontend using Docker:

    ```bash
    docker build -t frontend-angular -f frontend-angular/Dockerfile .
    docker run -p 8080:8080 frontend-angular
    ```
   
## License
This project is licensed under the MIT License.

## Author
Jorge Andrés Álvarez Melchor

