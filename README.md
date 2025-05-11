BudgetU
<div align="center">
  <h3>Financial Freedom for College Students</h3>
</div>
📚 About
BudgetU is a financial management platform designed specifically for college students. We help students set realistic monthly budgets, track expenses through bank integration, and make informed spending decisions in real-time. Our mission is to empower students to take control of their finances and develop healthy money habits that last a lifetime.

"Can I afford this burger right now?" - BudgetU has the answer.

✨ Features
💰 Smart Budget Creation

Set up personalized monthly budgets in minutes
Auto-allocate funds across essential and discretionary categories
Choose from templates designed for different student situations

🏦 Bank Statement Integration

Securely connect your bank accounts
Automatically categorize and track all transactions
Get a holistic view of your spending habits

🛒 Real-Time Spending Guidance

Check if you can afford a purchase before making it
Receive alternative spending suggestions
Get alerts when approaching category limits

📊 Financial Insights

Visualize your spending patterns
Track progress toward financial goals
Forecast your end-of-month balance

🚀 Getting Started
Prerequisites

Node.js (v16+)
npm or yarn
MongoDB (local or Atlas connection)
Supabase account (for authentication)

Installation

Clone the repository

bashgit clone https://github.com/yourusername/budgetu.git
cd budgetu

Install dependencies

bash# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install

Set up environment variables

bash# In the server directory, create a .env file
touch .env

# Add the following variables
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret

Start the development servers

bash# Start backend server
cd server
npm run dev

# In a new terminal, start frontend
cd client
npm start

Visit http://localhost:3000 to see the application running

🧰 Tech Stack
Frontend

React.js
Redux for state management
Material UI components
Chart.js for data visualization
Progressive Web App capabilities

Backend

Node.js with Express
MongoDB for database
Supabase for authentication
Plaid API for bank integration
JWT for secure communication

Infrastructure

AWS for cloud hosting
CI/CD with GitHub Actions
MongoDB Atlas for database hosting

Fork the repository
Create a feature branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'Add some amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
🙏 Acknowledgements

<div align="center">
  <p>Made with ❤️ for students, by students</p>
  <p>© 2025 BudgetU Team</p>
</div>
