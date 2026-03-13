
# Windmill IoT Dashboard - Fullstack Exam Project

## Overview
### What this project does
- This project is a project by Christoffer Abraham to create a website that interfaces with a wind farm using MQTT and StateleSSE for the 4th semester Fullstack Exam.
- Key Features:
    - A login page with authentication.
    - A dashboard with windmills and their current status.
    - A windmill page with real-time telemetry and adjustments.
    - A page for sending commands to the windmills.
    - An alert page for displaying alerts.

### Tech stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, React Router 7.
- **Backend**: ASP.NET Core (.NET 10), Entity Framework Core.
- **Database**: PostgreSQL (Neon Tech).
- **Tooling**: Vitest (Frontend Testing), Swagger (NSwag) (API Documentation).

## Architecture
- **Frontend**: Client-side SPA using React. Communicates with the Backend via RESTful API calls and StateleSSE for real-time updates.
- **Backend**: Layered architecture with Controllers, Services, and Data Access layers. Uses EF Core for ORM.

## Security (& Authorization)

#### Protected areas (routes/pages)
- / : Operator dashboard.
- /login: Public.

### Secrets handling
- Deployment uses fly.toml where secrets should be set using fly secrets set.
- My JWT secret is probably shown in the AuthContext.tsx file I think? Oops.

## Environment (& Configuration)
### Prerequisites
- **Node.js**: v18.0 or higher
- **npm**: v9.0 or higher
- **.NET SDK**: 10.0
- **PostgreSQL**: 15 or higher (Neon recommended)

### Local setup
1. **Clone repo**: git clone <https://github.com/DiasTAPvP/FSExam>
2. **Backend Setup**:
    - Navigate to server/api.
    - Update appsettings.Development.json with your local DB connection string.
    - Run dotnet restore.
    - Run dotnet run.
    - **Note**: By default, the backend uses Docker Testcontainers for PostgreSQL in Development. Ensure Docker is running.
3. **Frontend Setup**:
    - Navigate to client.
    - Run npm install.
    - Run npm run dev.

### Configuration
#### Frontend
- Managed via Vite environment variables and proxy settings if applicable.

#### Backend
- appsettings.json: Global configuration.
- appsettings.Development.json: Local development overrides (DB, JwtSecret).

#### Database
- Migrations are handled via EF Core.
- Database was created using Neon Tech's PostgreSQL service.
- DB schema is defined in server/dataaccess/schema.sql but might be missing a table I think? I added one manually through Neon at one point.
- seed.sql also has data that was inserted into the DB during development, namely users and initial windmills.

## Linting (& Formatting)
### Frontend
- **ESLint**: npm run lint
- **Prettier**: npm run format

### Backend
- **dotnet format**: Use dotnet format for standard .NET code styling.

## Scripts & Commands
### Frontend
- npm install: Install dependencies.
- npm run dev: Start development server.
- npm run build: Build for production.
- npm test: Run Vitest.

### Backend
- dotnet restore: Restore NuGet packages.
- dotnet build: Build the solution.
- dotnet run: Start the API server.
- dotnet test: Run backend tests.

## Current State & What Works
- **Real-Time Metrics**: We receive data from the MQTT Broker and display it in the frontend with live updates.
- **Live Adjustments**: It is possible to adjust the controls given by the MQTT Broker for the windmills.
- **State Management**: Reactive UI using Tailwind.

## Known Bugs (& Limitations)
- **Alerts**: Currently alerts are not working quite right in the frontend and is missing Delete functionality (the Clear button)
- **Live Adjustments**: Commands might require a hard refresh sometimes? Unsure why

## Test Logins (& Links)
### Environments
- **Website**: https://windfarm-iot-fsexam.fly.dev/
- **API Documentation**: https://windfarm-iot-fsexam.fly.dev/swagger/

### Test accounts
| Username | Password           |
|:---------|:-------------------|
| operator | hashed_windmill123 |


