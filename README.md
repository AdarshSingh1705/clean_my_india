<h2 align="center"># Clean-My-India: </h2>

Civic Issue Reporting Portal

A full-stack web application that allows citizens to report local issues (like potholes, garbage, water leakage, etc.), track their status, and engage with them through likes and comments. Officials can update statuses and assign issues.

This project is built using React (frontend), Node.js + Express (backend), and PostgreSQL (database).

🚀 Features 👥 Public Users (No Login Required)

View all reported issues.

Browse by filters: pending, in_progress, resolved, closed.

👤 Registered Users

Report a new issue with title, description, category, location, and optional image.

Like and comment on issues.

Track issue status updates in real time.

🛠️ Officials / Admin

Update the status of an issue (pending, in_progress, resolved, closed).

Assign issues to specific staff.

Moderate comments.

Clean My India

A platform for reporting, tracking, and resolving civic issues in India.

Project Structure
clean-my-india/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── app.js
│   └── config.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   │   ├── Dashboard.js
│   │   │   ├── Issues.js
│   │   │   ├── Profile.js
│   │   │   └── ...
│   │   ├── services/
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── ...
├── .gitignore
├── README.md
└── package.json
#Screenshot:

image
🛠️ Tech Stack

Frontend: React, Axios, TailwindCSS / CSS

Backend: Node.js, Express.js

Database: PostgreSQL

Authentication: JWT (JSON Web Tokens)

File Uploads: Multer (for issue images)

Real-time Updates: Socket.io

⚙️ Installation 1️⃣ Clone the repo git clone https://github.com/your-username/civic-issues-portal.git cd civic-issues-portal

2️⃣ Setup Backend cd backend npm install

Create a .env file inside backend/ with the following:

PORT=5000 DATABASE_URL=postgresql://username:password@localhost:5432/yourdbname JWT_SECRET=your_jwt_secret

Run database migrations (create tables for users, issues, comments, likes).

CREATE TABLE users ( id SERIAL PRIMARY KEY, name VARCHAR(100), email VARCHAR(150) UNIQUE, password VARCHAR(200), role VARCHAR(50) DEFAULT 'user' );

CREATE TABLE issues ( id SERIAL PRIMARY KEY, title VARCHAR(255), description TEXT, category VARCHAR(100), latitude NUMERIC, longitude NUMERIC, image_url TEXT, status VARCHAR(50) DEFAULT 'pending', priority VARCHAR(50) DEFAULT 'medium', created_by INT REFERENCES users(id), assigned_to INT REFERENCES users(id), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, resolved_at TIMESTAMP );

CREATE TABLE comments ( id SERIAL PRIMARY KEY, issue_id INT REFERENCES issues(id), user_id INT REFERENCES users(id), text TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP );

CREATE TABLE likes ( id SERIAL PRIMARY KEY, issue_id INT REFERENCES issues(id), user_id INT REFERENCES users(id) );

Start backend:

npm start

3️⃣ Setup Frontend cd frontend npm install npm start

By default, frontend runs on http://localhost:3000 and backend on http://localhost:5000.

🔑 API Endpoints Public

GET /api/issues → Fetch all issues

GET /api/issues/:id → Fetch a single issue

Protected (Login Required)

POST /api/issues → Create new issue

POST /api/issues/:id/like → Like an issue

DELETE /api/issues/:id/like → Unlike an issue

POST /api/issues/:id/comment → Add a comment

PATCH /api/issues/:id/status → Update issue status (officials only)

PATCH /api/issues/:id/assign → Assign an issue (officials only)

🛡️ Authentication Flow

Users register/login to get a JWT token.

Token is sent in Authorization: Bearer header.

Public routes (view issues) don’t need login.

Protected routes (like, comment, report issue) require a valid token.

📌 Roadmap

Add map view for issue locations.

Enable push notifications for status updates.

Add image preview in comments.

Add role-based dashboards.

🎮 Future Enhancements AI Verification Module: Image authenticity validation (planned)

Priority Tagging: Critical issue escalation for public health hazards

SMS/WhatsApp Integration: Non-smartphone user accessibility

Push Notifications: Real-time status updates

Gamification: Badges, leaderboards, and contributor rewards

Multi-language Support: Regional language localization

Offline Mode: Queue reports when connectivity is limited

🤝 Contributing We welcome contributions from the community! Please follow these steps:

Fork the repository

Create a feature branch (git checkout -b feature/amazing-feature)

Commit your changes (git commit -m 'Add some amazing feature')

Push to the branch (git push origin feature/amazing-feature)

Open a Pull Request

📜 License

MIT License © 2025 Your Name

<p align="center">_Designed and Developed with ❤️ by Adarsh Singh._</p>

