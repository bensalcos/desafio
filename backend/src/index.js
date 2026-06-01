const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const opportunitiesRoutes = require('./routes/opportunities');
const chatRoutes = require('./routes/chat');
const authRoutes = require('./routes/auth');
const { authenticateToken } = require('./middleware/auth');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/opportunities', authenticateToken, opportunitiesRoutes);
app.use('/api/chat', authenticateToken, chatRoutes);

// Manejador global de errores basico
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Algo salió mal en el servidor!' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
