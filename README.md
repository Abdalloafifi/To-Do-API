# Simple Backend for REST, GraphQL, and gRPC

A simple backend service supporting REST, GraphQL, and gRPC protocols.  
It allows you to upload, modify, delete existing targets, and retrieve all, one, completed targets, or vice versa.

## Features

- Upload new targets
- Modify existing targets
- Delete targets
- Retrieve all targets
- Retrieve a single target
- Retrieve completed or incomplete targets

## Getting Started

### Prerequisites

- Node.js installed
- MongoDB running locally or remotely

### Installation

```bash
npm install
Running the Server
To run the server in development mode with auto-reloading, use:

bash
Copy
Edit
npm i nodemon
npm run start
Or simply:

bash
Copy
Edit
npm start
Environment Variables
Create a .env file in the root of your project with the following variables:

ini
Copy
Edit
PORT=5000
NODE_ENV=development
MONGO_URL=mongodb://localhost:27017/todo
JWT_SECRET=8f3b7c8dfe0192a4b3f7cd890d5a345cf24daeb9
CRYPTO_SECRET=MySuperSecureEncryptionKey2025!

EMAIL=your.email@gmail.com
PASSWORD=yourGooglePassword
Note: Replace your.email@gmail.com and yourGooglePassword with your actual Gmail address and password (or app password if using 2FA).
