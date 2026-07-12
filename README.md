# QuizBuzz
### AI-Powered Quiz Generation & Learning Platform

QuizBuzz is a full-stack web application that enables teachers to generate quizzes from study materials using AI, create downloadable worksheet PDFs, and allows students to take quizzes, track their performance, and receive personalized learning insights.

The platform combines **React**, **Node.js**, **MongoDB**, **Gemini AI**, and **Pinecone Vector Database** to create an intelligent assessment system.

---

# Features

## Teacher

- Secure authentication (JWT)
- Upload PDF study materials
- AI-powered question generation using Gemini
- Semantic search using Pinecone
- Review and approve AI-generated questions
- Create quizzes from approved questions
- Publish / Unpublish quizzes
- Delete quizzes
- Teacher dashboard
- Analytics dashboard

---

## Student

- Secure login
- Browse published quizzes
- Attempt quizzes
- Automatic scoring
- View latest score
- View previous attempts
- Review:
  - Selected answer
  - Correct answer
  - Result (Correct/Incorrect)
- Dashboard with:
  - Total quizzes attempted
  - Average score
  - XP
  - Learning progress

---

## Authentication

- Register
- Login
- JWT Authentication
- Refresh Tokens
- Logout
- Change Password
- Forgot Password
- OTP Verification
- Reset Password

---

# AI Features

- PDF content extraction
- AI Question Generation
- Teacher Review Workflow
- Vector Embeddings
- Semantic Retrieval
- Intelligent Quiz Creation

---

# Tech Stack

## Frontend

- React
- Vite
- Tailwind CSS
- React Query
- Axios
- React Router
- Framer Motion
- Recharts
- Lucide React

---

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Multer
- Nodemailer

---

## AI

- Google Gemini API
- Pinecone Vector Database

---

# Project Structure

```
QuizBuzz
│
├── frontend
│   ├── src
│   ├── components
│   ├── features
│   ├── contexts
│   ├── services
│   └── pages
│
├── backend
│   ├── src
│   │   ├── controllers
│   │   ├── middleware
│   │   ├── models
│   │   ├── routes
│   │   ├── services
│   │   ├── utils
│   │   └── config
│   │
│   └── uploads
│
└── README.md
```

---

# Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/quizbuzz.git
```

---

## Backend

```bash
cd backend

npm install

npm run dev
```

Backend runs on

```
http://localhost:5000
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

Frontend runs on

```
http://localhost:5173
```

---

# Environment Variables

## Backend (.env)

```env
PORT=5000

MONGODB_URI=

JWT_SECRET=
JWT_EXPIRES_IN=1d

JWT_REFRESH_SECRET=
JWT_REFRESH_EXPIRES_IN=7d

GEMINI_API_KEY=

PINECONE_API_KEY=
PINECONE_INDEX_NAME=

EMAIL_USER=
EMAIL_PASS=
```

## 📸 Screenshots

### Login

<img width="959" alt="Login" src="https://github.com/user-attachments/assets/66ac86ac-a6cc-4a4a-80d4-2011a47031a5" />

### Register

<img width="959" alt="Register" src="https://github.com/user-attachments/assets/40303d04-2a4d-4053-9e1e-5224b7d5e7bf" />

### Teacher Dashboard

<img width="959" alt="Teacher Dashboard" src="https://github.com/user-attachments/assets/b73fe800-7543-4862-8c9e-58651cdff5bb" />

### AI Question Generation

<img width="956" alt="AI Question Generation" src="https://github.com/user-attachments/assets/ba0f8cc2-df15-49fd-b263-108e781506c3" />

### Question Review

<img width="958" alt="Question Review" src="https://github.com/user-attachments/assets/49a34b89-677a-45ff-bb4e-21c3ae340a33" />

## Quiz List

<img width="957" height="406" alt="Quiz List" src="https://github.com/user-attachments/assets/a99d4552-dddb-4a91-a0a4-7c5171eb171e" />


### Student Dashboard

<img width="955" alt="Student Dashboard" src="https://github.com/user-attachments/assets/2b54014f-4b13-4e13-98ee-d2b07000adcf" />

### Quiz Attempt

<img width="959" alt="Quiz Attempt" src="https://github.com/user-attachments/assets/a11af745-327d-4b88-90d1-d7ff4587c7c9" />

### Analytics

<img width="959" alt="Analytics 1" src="https://github.com/user-attachments/assets/0659e137-9ac1-4a75-b442-af4fba798205" />



### Results

<img width="955" alt="Results" src="https://github.com/user-attachments/assets/4b5a08e8-a94a-45f5-a35e-39b2a2a55e11" />

---


# License

This project is developed for educational purposes.
