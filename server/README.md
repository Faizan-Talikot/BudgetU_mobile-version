# BudgetU Backend

This is the backend API for the BudgetU financial management application for college students.

## Features

- User authentication with JWT
- Budget creation and management
- Transaction tracking and categorization
- Financial insights and analytics

## Tech Stack

- Node.js
- Express.js
- MongoDB
- JWT for authentication

## Setup Instructions

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file in the server directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb+srv://faizan:1234@cluster0.e4p86uw.mongodb.net/BudgetU
   JWT_SECRET=your-secret-key
   NODE_ENV=development
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. For production:
   ```
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login a user
- `GET /api/users/profile` - Get current user profile (protected)
- `PUT /api/users/profile` - Update user profile (protected)

### Budgets
- `POST /api/budgets` - Create a new budget (protected)
- `GET /api/budgets` - Get all user budgets (protected)
- `GET /api/budgets/active` - Get active budget (protected)
- `GET /api/budgets/:id` - Get budget by ID (protected)
- `PUT /api/budgets/:id` - Update budget (protected)
- `DELETE /api/budgets/:id` - Delete budget (protected)

### Transactions
- `POST /api/transactions` - Add a new transaction (protected)
- `GET /api/transactions` - Get all transactions with filters (protected)
- `GET /api/transactions/summary` - Get spending summary by category (protected)
- `GET /api/transactions/:id` - Get transaction by ID (protected)
- `PUT /api/transactions/:id` - Update transaction (protected)
- `DELETE /api/transactions/:id` - Delete transaction (protected)

## Database Schema

### User
- firstName (String, required)
- lastName (String, required)
- email (String, required, unique)
- password (String, required, hashed)
- isVerified (Boolean, default: false)
- profilePicture (String)
- createdAt (Date)

### Budget
- user (ObjectId, ref: 'User')
- name (String, required)
- totalAmount (Number, required)
- startDate (Date, required)
- endDate (Date, required)
- categories (Array of category objects)
- isActive (Boolean, default: true)
- createdAt (Date)

### Transaction
- user (ObjectId, ref: 'User')
- amount (Number, required)
- description (String, required)
- category (String, required)
- date (Date)
- isIncome (Boolean, default: false)
- paymentMethod (String, enum)
- location (String)
- externalId (String) - for bank integration
- receiptImage (String)
- notes (String)
- createdAt (Date)

## Authentication

All protected routes require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-token>
``` 