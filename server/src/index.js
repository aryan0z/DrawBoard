require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const connectDB = require("./config/db");
const { Server } = require("socket.io");

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

require("./sockets/boardSocket")(io);

app.use("/api/auth", require("./routes/authRoutes"));

server.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);
