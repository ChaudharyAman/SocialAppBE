const express = require('express');
const cors = require('cors');
const sequelize = require('./Config/db');
const allRoutes = require('./Routes/routes');
require('dotenv').config();
const { initSocket } = require('./socket');
const http = require('http');
const cookieParser = require('cookie-parser')


const app = express();

const PORT = process.env.PORT || 5000;

app.use(cookieParser());

const server = http.createServer(app);

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));


app.use(express.json());

app.use('/api/v1', allRoutes);

// app.use(express.json({
//   strict: true,
//   type: ['application/json']
// }));



sequelize.sync()
  .then(() => console.log('Database synced'))
  .catch(err => console.error('Sync error:', err));

  initSocket(server);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
