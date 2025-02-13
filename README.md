# Recipe Management Comparison

This project aims to compare **React** and **Angular** frameworks by developing a recipe management web application with shared backend services. The comparison is based on metrics like learning curve, development complexity, performance, and user experience.

## Version
Current version: v1.0.0

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
├── .env                      # Environment variables
├── .eslintrc.json            # ESLint configuration
├── .gitignore                # Files and folders to ignore by Git
├── .prettierrc               # Prettier configuration
├── Dockerfile                # Configuration to generate the container image
├── docker-compose.yml        # Orchestrator for containers (backend and MongoDB)
├── package.json              # Dependencies, scripts, and project metadata
├── tsconfig.json             # TypeScript configuration and import aliases
└── src/                      # Project source code
   ├── index.ts               # Application entry point
   ├── swagger/               # API documentation with Swagger
   │   └── swagger.yaml       # OpenAPI specification
   ├── application/           # Use cases and application logic
   ├── domain/                # Domain entities and ports (interfaces)
   ├── infrastructure/        # Implementation of repositories, controllers, and external service configurations
   ├── interfaces/            # Route definitions and input adapters
   ├── shared/                # Utilities, middlewares, and DTOs
   └── tests/                 # Unit and integration tests

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

## License
This project is licensed under the MIT License.

## Author
Jorge Andrés Álvarez Melchor

