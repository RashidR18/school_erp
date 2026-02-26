🎓 School ERP System – MERN Stack

A full-stack School ERP (Enterprise Resource Planning) System built using the MERN Stack (MongoDB, Express.js, React.js, Node.js).
This system helps manage students, teachers, authentication, and other school-related operations efficiently.

🚀 Live Demo

https://school-erp-rust.vercel.app


🛠️ Tech Stack
Frontend

React.js (Vite)

Axios

React Router DOM

Tailwind CSS

React Toastify

Backend

Node.js

Express.js

MongoDB (Mongoose)

JWT Authentication

bcrypt (Password Hashing)

Deployment

Frontend: Vercel / Netlify / Render

Backend: Render / Railway

Database: MongoDB Atlas

📂 Project Structure

school_erp/

│

├── frontend/          # React Frontend

│   ├── src/

│   ├── components/

│   ├── pages/

│   └── services/

│

├── backend/           # Node + Express Backend

│   ├── controllers/

│   ├── models/

│   ├── routes/

│   ├── middleware/

│   └── server.js

│

└── README.md


🔐 Features

👨‍🎓 Student Management

👩‍🏫 Teacher/Admin Role System

🔑 JWT Authentication (Login/Register)

🔒 Password Hashing using bcrypt

📩 Contact / Query Management

🌐 Fully Connected Frontend & Backend

📦 RESTful API Architecture


⚙️ Installation & Setup

1️⃣ Clone the Repository
git clone https://github.com/your-username/school_erp.git
cd school_erp
🖥️ Backend Setup
cd backend
npm install
Create .env file in backend folder:
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
Run Backend
npm run dev

Backend runs on:

http://localhost:5000

🌐 Frontend Setup
cd frontend
npm install
npm run dev

Frontend runs on:

http://localhost:5173
🔄 API Endpoints (Example)
Auth Routes

POST /api/auth/register

POST /api/auth/login

User Routes

GET /api/users

GET /api/users/:id

DELETE /api/users/:id

(Add or modify according to your project routes)

🧪 Environment Variables
Backend (.env)
PORT=
MONGO_URI=
JWT_SECRET=
Frontend (.env)
VITE_API_URL=http://localhost:5000
📦 Deployment Guide

Backend (Render)

Push backend to GitHub

Create new Web Service on Render

Add environment variables

Deploy


Frontend (Vercel)

Import GitHub repository

Add environment variables

Deploy


👨‍💻 Author

Rashid Ali
MERN Stack Developer
GitHub: https://github.com/RashidR18
Portfolio: https://portfolio-frontend-iota-indol.vercel.app/
