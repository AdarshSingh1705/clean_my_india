# Clean My India - Frontend

React-based frontend for Clean My India civic issue reporting platform.

## 🚀 Quick Start

### Install Dependencies
```bash
npm install
```

### Setup Environment
Create `.env` file:
```env
REACT_APP_API_URL=http://localhost:5000
```

### Run Development Server
```bash
npm start
```

Runs on `http://localhost:3000`

### Build for Production
```bash
npm run build
```

## 📁 Project Structure

```
src/
├── components/      # Reusable UI components
├── contexts/        # React Context providers
├── pages/          # Page components
├── services/       # API service layer
├── App.js          # Main app component
└── index.js        # Entry point
```

## 🛠️ Tech Stack

- React
- React Router
- Axios
- TailwindCSS
- Context API

## 🔗 API Integration

All API calls are handled through `services/api.js` which connects to the backend at `REACT_APP_API_URL`.

---

See main [README](../README.md) for full project documentation.
