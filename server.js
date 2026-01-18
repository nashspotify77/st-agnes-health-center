// server.js - Final Fixed ESM Version
import express from 'express';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import helmet from 'helmet';
import { fileURLToPath } from 'url';

const app = express();
// Vercel dynamically assigns a port, so process.env.PORT is mandatory
const port = process.env.PORT || 3001; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Middleware Setup ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
  })
);

// --- Static File Serving FIX ---
// Use path.join to ensure the server finds the 'public' folder on Vercel's environment
app.use(express.static(path.join(__dirname, 'public')));

// --- Root Route FIX ---
// This explicitly sends index.html when someone visits the base URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- File System & Utility Functions ---
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

function saveJson(filename, obj) {
  const file = path.join(dataDir, filename);
  let arr = [];
  try {
    if (fs.existsSync(file)) {
      arr = JSON.parse(fs.readFileSync(file, 'utf8') || '[]');
    }
  } catch (e) {
    arr = [];
  }
  arr.push(obj);
  fs.writeFileSync(file, JSON.stringify(arr, null, 2));
}

function sanitizeInput(v) {
  if (typeof v !== 'string') return v;
  return v.replace(/</g, '&lt;').replace(/>/g, '&gt;').trim();
}

// --- Email Transporter ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || ''
  }
});

function trySendMail(mailOptions) {
  return new Promise((resolve) => {
    if (!transporter || !transporter.sendMail || !process.env.EMAIL_USER) {
      console.log('Email not configured; skipping email send.');
      return resolve({ ok: false, error: 'Email not configured' });
    }
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Email send error:', error);
        return resolve({ ok: false, error });
      } else {
        console.log('Email sent:', info.response);
        return resolve({ ok: true, info });
      }
    });
  });
}

// --- Routes ---
app.post('/appointment', async (req, res) => {
  const appointment = {
    fullName: sanitizeInput(req.body.fullName || ''),
    email: sanitizeInput(req.body.email || ''),
    phone: sanitizeInput(req.body.phone || ''),
    message: sanitizeInput(req.body.message || ''),
    createdAt: new Date().toISOString()
  };

  try {
    saveJson('appointments.json', appointment);
  } catch (e) {
    console.error('Failed to save appointment locally:', e);
  }

  const mailOptions = {
    from: process.env.EMAIL_USER || 'no-reply@example.com',
    to: process.env.NOTIFY_EMAIL || 'brandontnashong@gmail.com',
    subject: 'New Appointment Request - St. Agnes Health Centre',
    text: `Name: ${appointment.fullName}\nEmail: ${appointment.email}\nPhone: ${appointment.phone || 'N/A'}\nMessage: ${appointment.message || 'N/A'}`
  };

  const result = await trySendMail(mailOptions);
  
  if (result.ok) {
    return res.send('Appointment request received and email sent');
  } else {
    return res.send('Appointment request received and saved (email not sent)');
  }
});

// --- Server Start ---
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});