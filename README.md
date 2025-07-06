🗂️ Project: Task Management System
🚀 Overview
This project is a comprehensive Task Management System that includes:

Multiple Interfaces: REST API, GraphQL, and gRPC

Advanced Security System: Multi-layered encryption and multi-factor authentication

User Management: Registration, verification, login/logout

Task Management: Create, update, delete, and change task statuses

⚙️ Core Components
🔐 Advanced Authentication System:
New user registration with email verification (OTP)

Secure login using encrypted JWT

Password recovery via verification code

Multi-layer encryption (AES-256 + JWT)

✅ Task Management:
Full CRUD operations for tasks

Change task status (completed/incomplete)

Filter tasks by status

Multi-interface support (REST, GraphQL, gRPC)

🛡️ Security System:
Multi-layered token encryption

Protection against XSS and NoSQL Injection

Rate limiting for requests

Input validation with Joi

Enhanced security headers (Helmet, HPP)

🛠️ Tech Architecture
Authentication Controllers:

authController.js: Handles registration, verification, and login

forgetpassword.js: Password recovery

verifytoken.js: Token verification

Task Management:

tasks.js: REST API routes

schema.js: GraphQL definitions

server.js: gRPC server

Security Middleware:

securityMiddleware.js: Secures REST/GraphQL

grpcSecurity.js: Secures gRPC

generateTokenAndCookies.js: Encrypted token generation

Data Models:

Tasks.js: Task model

auth.js: User model

Configuration & Setup:

app.js: Main application entry point

connect.js: MongoDB connection

error.js: Centralized error handler

🔒 Unique Security Features
Multi-layer Encryption:
js
Copy
Edit
function generateEncryptedToken(user) {
  const token = jwt.sign(...); // First Layer: JWT
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(...); // Second Layer: AES-256
  // Returns an encrypted token formatted as: iv:salt:encrypted
}
Triple-layer Verification:
Verify encrypted token

Match JWT data with database records

Ensure account is activated

Security Against Attacks:
js
Copy
Edit
// In securityMiddleware.js
app.use(xssClean());       // Prevent XSS attacks  
app.use(mongoSanitize());  // Prevent NoSQL injection  
app.use(hpp());            // Prevent HTTP parameter pollution  
🌐 Multi-Protocol Interfaces
REST API:

Routes: /api/auth, /api/tasks

Full CRUD support

GraphQL:

Queries: tasks, task(id)

Mutations: addTask, updateTask, toggleTask

gRPC:

TaskService defined in tasks.proto

Full task management support

Enhanced with withSecurity middleware

💡 Key Highlights
Multi-protocol Integration: REST, GraphQL, and gRPC in one system

Multi-step Authentication:

Email verification during registration

Code verification for password reset

Modular Design: Clear separation of concerns:

Controllers

Middleware

Models

Detailed Logs: gRPC logs include peer source tracking

js
Copy
Edit
