<h1 align="center">Clean My India</h1>
<p align="center">Civic Issue Reporting Portal</p>

A full-stack web application that allows citizens to report local issues (potholes, garbage, water leakage, etc.), track their status, and engage through likes and comments. Officials can update statuses and assign issues.

## 🚀 Features

### 👥 Public Users (No Login Required)
- View all reported issues
- Browse by filters: status, category, priority
- View issue details with comments and likes

### 👤 Registered Users
- Report new issues with location and optional image
- Like and comment on issues
- Track issue status updates in real-time
- View personal dashboard

### 🛠️ Officials / Admin
- Update issue status (pending, in_progress, resolved, closed)
- Assign issues to staff members
- Manage users and moderate content

## 📁 Project Structure

```
clean-my-india/
├── backend/              # Node.js + Express API
│   ├── middleware/       # Auth & error handling
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── test/            # Testing files
│   ├── server.js        # Entry point
│   └── db.js           # Database connection
├── frontend/            # React application
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── contexts/    # React contexts
│   │   ├── pages/       # Page components
│   │   └── services/    # API services
│   └── public/
└── README.md
```

## 📸 Screenshot

<img width="1740" height="853" alt="Clean My India Dashboard" src="https://github.com/user-attachments/assets/98572a65-56bb-46de-9f52-60c9e4e4442e" />

## 🛠️ Tech Stack

**Frontend:**
- React
- Axios
- TailwindCSS

**Backend:**
- Node.js + Express
- PostgreSQL
- JWT Authentication
- Socket.io (real-time updates)
- Multer (file uploads)

## ⚙️ Installation

### 1️⃣ Clone Repository
```bash
git clone https://github.com/your-username/clean-my-india.git
cd clean-my-india
```

### 2️⃣ Setup Backend
```bash
cd backend
npm install
```

Create `.env` file:
```env
DB_HOST=your-database-host
DB_NAME=clean_india_db
DB_USER=your-db-user
DB_PASS=your-db-password
DB_PORT=5432
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

Setup database:
```bash
# Run the SQL script in your PostgreSQL database
psql -h host -U user -d database -f backend/test/setup-database.sql
```

Start backend:
```bash
npm start
```

### 3️⃣ Setup Frontend
```bash
cd frontend
npm install
npm start
```

**URLs:**
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

## 🔑 API Endpoints

### Public
- `GET /api/health` - Health check
- `GET /api/issues` - Get all issues
- `GET /api/issues/:id` - Get single issue

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Protected (Login Required)
- `POST /api/issues` - Report new issue
- `POST /api/issues/:id/like` - Like issue
- `DELETE /api/issues/:id/like` - Unlike issue
- `POST /api/issues/:id/comment` - Add comment

### Official/Admin Only
- `PATCH /api/issues/:id/status` - Update status
- `PATCH /api/issues/:id/assign` - Assign issue

## 🧪 Testing

### Run API Tests
```bash
cd backend
npm test
```

### Test with Postman
Import `backend/test/Clean-My-India-API.postman_collection.json` in Postman.  
See `backend/test/POSTMAN_GUIDE.md` for details.

### Test Database Connection
```bash
node backend/test/test-db-connection.js
```

## 🎮 Future Enhancements

- 🗺️ Map view for issue locations
- 🔔 Push notifications for status updates
- 🤖 AI verification for image authenticity
- 📱 SMS/WhatsApp integration
- 🏆 Gamification (badges, leaderboards)
- 🌐 Multi-language support
- 📴 Offline mode

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

MIT License © 2025

<p align="center">Designed and Developed with ❤️ by Adarsh Singh</p>
