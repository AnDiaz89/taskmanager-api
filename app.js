const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const aiRoutes = require('./routes/aiRoutes');
const subtaskRoutes = require('./routes/subtaskRoutes');
const pdfRoutes = require('./routes/pdfRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const githubRoutes = require('./routes/githubRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'API funcionando correctamente' });
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api', subtaskRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api', weatherRoutes);
app.use('/api', reminderRoutes);
app.use('/api', githubRoutes);

module.exports = app;