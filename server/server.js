const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { runAutomaticPromotionJob } = require("./controllers/studentController");

require("dotenv").config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use("/api/auth", require("./routes/authRoutes"));

app.use("/api/test", require("./routes/testRoutes"));

app.use("/api/students", require("./routes/studentRoutes"));

app.use("/api/attendance", require("./routes/attendanceRoutes"));

app.use("/api/results", require("./routes/resultRoutes"));

app.use("/api/fees", require("./routes/feeRoutes"));

async function runYearlyPromotionCheck() {
  try {
    const year = new Date().getFullYear();
    const report = await runAutomaticPromotionJob(year);
    if (report.promotedCount > 0) {
      console.log(
        `[Promotion Job] Promoted ${report.promotedCount} students for year ${year}`,
      );
    }
  } catch (err) {
    console.error("[Promotion Job] Failed:", err.message);
  }
}

runYearlyPromotionCheck();
setInterval(runYearlyPromotionCheck, 24 * 60 * 60 * 1000);

// IMPORTANT: Use dynamic PORT for Render
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
