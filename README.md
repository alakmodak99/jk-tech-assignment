# NestJS Document Management System

This is a robust document management system built with NestJS, featuring user authentication, role-based access control, document management, and document ingestion capabilities.

## Project Overview

The system consists of four main modules:

1. Authentication Module: Handles user authentication and authorization using JWT tokens.
2. Users Module: Manages user accounts and role-based access control.
3. Documents Module: Handles document upload, storage, and retrieval.
4. Ingestion Module: Processes uploaded documents and integrates with external services.

## Prerequisites

Before starting, ensure you have the following installed:

- Node.js (v14 or later)
- PostgreSQL (v12 or later)
- npm (v6 or later)

## Installation

First, clone the repository and install dependencies:

```bash
git clone <repository-url>
cd <project-directory>
npm install
```

Install all required packages:

```bash
# Core NestJS packages
npm install @nestjs/common @nestjs/core @nestjs/platform-express reflect-metadata

# Authentication packages
npm install @nestjs/passport @nestjs/jwt passport passport-jwt bcrypt
npm install -D @types/passport-jwt @types/bcrypt

# Database packages
npm install @nestjs/typeorm typeorm pg

# Validation and configuration
npm install class-validator class-transformer @nestjs/config

# HTTP module for ingestion service
npm install @nestjs/axios axios

# Utility packages
npm install @nestjs/mapped-types

# Development dependencies
npm install -D @nestjs/testing jest @types/jest supertest @types/supertest
```

## Configuration

1. Create a `.env` file in the project root:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=your_database
DB_SYNC=true  # Set to false in production

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1d
```

2. Configure your database by ensuring PostgreSQL is running and create the database:

```sql
CREATE DATABASE your_database;
```

## Project Structure

The application follows a modular structure:

```
src/
├── auth/                  # Authentication module
│   ├── decorators/
│   ├── dto/
│   ├── guards/
│   ├── strategies/
│   └── tests/
├── users/                 # Users module
│   ├── dto/
│   ├── entities/
│   └── tests/
├── documents/            # Documents module
│   ├── dto/
│   ├── entities/
│   └── tests/
├── ingestion/           # Ingestion module
│   ├── dto/
│   ├── entities/
│   └── tests/
└── common/              # Shared components
    ├── filters/
    └── interceptors/
```

## Module Implementations

### Authentication Module

The authentication module handles user authentication using JWT tokens. Configure it in your app.module.ts:

```typescript
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN', '1d') },
      }),
      inject: [ConfigService],
    }),
  ],
})
```

### Exception Handling and Response Transformation

Implement global filters and interceptors in main.ts:

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());
  await app.listen(3000);
}
```

## API Endpoints

### Authentication

- POST /auth/register - Register a new user
- POST /auth/login - User login

### Users

- GET /users - Get all users (Admin only)
- GET /users/:id - Get user by ID
- PATCH /users/:id - Update user
- DELETE /users/:id - Delete user

### Documents

- POST /documents - Upload new document
- GET /documents - Get all documents
- GET /documents/:id - Get document by ID
- PATCH /documents/:id - Update document
- DELETE /documents/:id - Delete document

### Ingestion

- POST /ingestion - Start document ingestion
- GET /ingestion - Get all ingestion jobs
- GET /ingestion/:id - Get ingestion job status

## Running the Application

Development mode:
```bash
npm run start:dev
```

Production mode:
```bash
npm run build
npm run start:prod
```

## Testing

Run the test suite:

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Error Handling

The application uses a global HTTP exception filter that standardizes error responses:

```json
{
  "statusCode": 400,
  "timestamp": "2024-01-16T10:00:00.000Z",
  "path": "/api/endpoint",
  "message": "Error message",
  "error": "Error description"
}
```

## Response Transformation

Successful responses are transformed to include metadata:

```json
{
  "data": {}, // Your response data
  "timestamp": "2024-01-16T10:00:00.000Z",
  "status": 200,
  "path": "/api/endpoint"
}
```

## Security Considerations

1. Environment Variables
   - Use .env file for configuration
   - Never commit sensitive information
   - Use different configurations for development and production

2. Authentication
   - JWT tokens are used for authentication
   - Implement rate limiting for auth endpoints
   - Use secure password hashing with bcrypt

3. Authorization
   - Role-based access control (RBAC) implementation
   - Granular permissions for different user types

## Production Deployment

Before deploying to production:

1. Update environment variables:
   - Set DB_SYNC=false
   - Use strong JWT_SECRET
   - Configure production database credentials

2. Build the application:
```bash
npm run build
```

3. Run migrations instead of using synchronize:
```bash
npm run typeorm migration:run
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the repository or contact the development team.