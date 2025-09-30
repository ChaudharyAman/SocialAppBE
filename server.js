const express = require("express");
const cors = require("cors");
const sequelize = require("./Config/db");
const allRoutes = require("./Routes/routes");
require("dotenv").config();
const http = require("http");
const cookieParser = require("cookie-parser");
const { initSocket } = require("./socket");


const app = express();

const BASE_URL = process.env.BASE_URL

const PORT = process.env.PORT || 5000;

app.use(cookieParser());

app.use(
  cors({
    origin: BASE_URL,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(express.json());

app.use("/api/v1", allRoutes);

app.get('/' , (req,res)=>{
  return res.send("Server Is running")
})

// app.use(express.json({
//   strict: true,
//   type: ['application/json']
// }));

sequelize
  .sync()
  .then(() => console.log("Database synced"))
  .catch((err) => console.error("Sync error:", err));

const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
