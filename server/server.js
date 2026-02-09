const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

require("dotenv").config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));

app.use("/api/test", require("./routes/testRoutes"));

app.use("/api/students", require("./routes/studentRoutes"));

app.use("/api/attendance", require("./routes/attendanceRoutes"));

app.use("/api/results", require("./routes/resultRoutes"));

app.use("/api/fees", require("./routes/feeRoutes"));

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`),
);
