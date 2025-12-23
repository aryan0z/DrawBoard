# Whiteboard Application

A real-time collaborative whiteboard application built with React, Node.js, Socket.io, and MongoDB. Teachers and students can join rooms and collaborate on a shared whiteboard in real-time.

## Features

- 🔐 User authentication (Signup/Login)
- 👨‍🏫 Role-based access (Teacher/Student)
- 🎨 Real-time collaborative drawing
- 🏠 Room-based collaboration
- 🧹 Clear board functionality (Teachers only)
- 📱 Touch support for mobile devices
- 🎨 Modern, responsive UI with Tailwind CSS

## Tech Stack

### Frontend
- React 19
- React Router DOM
- Socket.io Client
- Tailwind CSS
- Axios

### Backend
- Node.js
- Express
- Socket.io
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas)
- npm or yarn

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd whiteboard-app
```

### 2. Install Server Dependencies

```bash
cd server
npm install
```

### 3. Install Client Dependencies

```bash
cd ../client
npm install
```

### 4. Environment Setup

Create a `.env` file in the `server` directory with the following variables:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/whiteboard
JWT_SECRET=your-secret-key-change-in-production
```

**Note:** 
- For MongoDB Atlas, use: `mongodb+srv://username:password@cluster.mongodb.net/whiteboard`
- Change `JWT_SECRET` to a secure random string in production

### 5. Start MongoDB

Make sure MongoDB is running on your system. If using local MongoDB:

```bash
# On Windows
net start MongoDB

# On macOS/Linux
sudo systemctl start mongod
```

## Running the Application

### Start the Server

```bash
cd server
npm run dev
```

The server will run on `http://localhost:5000`

### Start the Client

Open a new terminal:

```bash
cd client
npm start
```

The client will run on `http://localhost:3000`

## Usage

1. **Sign Up**: Create a new account by selecting your role (Teacher or Student)
2. **Login**: Sign in with your credentials
3. **Join Room**: Enter a room ID to join or create a collaborative whiteboard session
4. **Draw**: Click and drag to draw on the whiteboard
5. **Collaborate**: Multiple users can draw simultaneously in the same room
6. **Clear Board**: Teachers can clear the entire whiteboard (with confirmation)
7. **Leave Room**: Exit the current room and join a different one

## Project Structure

```
whiteboard-app/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Whiteboard.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   └── Board.jsx
│   │   ├── App.jsx
│   │   ├── socket.js
│   │   └── index.js
│   └── package.json
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── models/
│   │   │   └── User.js
│   │   ├── routes/
│   │   │   └── authRoutes.js
│   │   ├── sockets/
│   │   │   └── boardSocket.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Create a new user account
  - Body: `{ name, email, password, role }`
  
- `POST /api/auth/login` - Login user
  - Body: `{ email, password }`
  - Returns: `{ token, name, role }`

## Socket Events

### Client to Server
- `join-room` - Join a whiteboard room
- `leave-room` - Leave the current room
- `draw` - Send drawing data
- `clear-board` - Clear the whiteboard (teachers only)

### Server to Client
- `draw` - Receive drawing data from other users
- `clear-board` - Board cleared notification
- `user-joined` - User joined room notification

## Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- Protected routes on the frontend
- Input validation on server endpoints

## Future Enhancements

- [ ] Multiple drawing tools (pen, eraser, shapes)
- [ ] Color picker
- [ ] Text tool
- [ ] Undo/Redo functionality
- [ ] Save/Export whiteboard
- [ ] User presence indicators
- [ ] Chat functionality
- [ ] Screen sharing
- [ ] Video conferencing integration

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

