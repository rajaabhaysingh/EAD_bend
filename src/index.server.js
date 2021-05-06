const express = require("express");
const env = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");

const app = express();
const router = express.Router();

// managing routes
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const categoryRoutes = require("./routes/category");
const jobRoutes = require("./routes/job");
const addressRoute = require("./routes/address");
const applicationRoute = require("./routes/application");
const paymentRoute = require("./routes/payment");
const bannerRoute = require("./routes/banners");
const reviewRoute = require("./routes/review");
const conversationRoute = require("./routes/conversation");
const messageRoute = require("./routes/message");

env.config();

// middlewares
app.use(cors());
app.use(express.json());
// to store documents
app.use("/docs", express.static(path.join(__dirname, "files")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// to store dp
app.use("/private", express.static(path.join(__dirname, "profile_pic")));
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/category", categoryRoutes);
app.use("/job", jobRoutes);
app.use("/address", addressRoute);
app.use("/application", applicationRoute);
app.use("/payment", paymentRoute);
app.use("/banner", bannerRoute);
app.use("/review", reviewRoute);
app.use("/conversation", conversationRoute);
app.use("/message", messageRoute);

// just hend hellp from root
router.get("/", (req, res) => {
  return res.status(200).json({
    data: "Hello from wilswork backend team.",
  });
});

// connecting mongoose-online database
mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@ead-workgent.q30uu.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    }
  )
  .then((res) => {
    console.log("Database connected. You can start working now...");
  })
  .catch((err) => {
    console.log("Error: Couldn't connect to database.", err);
  });

PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    "Backend server running on PORT",
    PORT,
    "-- Please wait for database to connect..."
  );
});
