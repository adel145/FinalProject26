// This file is the Production Backend Entry Point
// Run using: ts-node server/index.ts

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/miktsoan')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

// --- Schemas ---
const UserSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  role: { type: String, enum: ['user', 'professional', 'admin'], default: 'user' },
  name: String,
  avatar: String,
  location: { lat: Number, lng: Number, address: String },
  language: { type: String, default: 'en' },
  history: [{ action: String, timestamp: Number, metadata: Object }]
});

const RequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  category: String,
  description: String,
  images: [String],
  status: { type: String, default: 'open' },
  location: { lat: Number, lng: Number }
});

const User = mongoose.model('User', UserSchema);
const Request = mongoose.model('Request', RequestSchema);

// --- Routes ---

// Auth
app.post('/api/auth/otp', async (req, res) => {
  // Simulate OTP send via Twilio
  console.log(`Sending OTP to ${req.body.phone}`);
  res.json({ success: true });
});

app.post('/api/auth/verify', async (req, res) => {
  const { phone, code, role } = req.body;
  if (code !== '123456') return res.status(400).json({ error: 'Invalid Code' });
  
  let user = await User.findOne({ phone });
  if (!user) {
    user = await User.create({ phone, role, name: 'New User' });
  }
  
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret');
  res.json({ token, user });
});

// Realtime Chat
io.on('connection', (socket) => {
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
  });
  
  socket.on('send_message', (data) => {
    io.to(data.roomId).emit('receive_message', data);
    // Save to DB here
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});