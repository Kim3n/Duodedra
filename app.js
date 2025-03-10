const express = require("express");
const path = require("node:path");
const favicon = require("serve-favicon");
const session = require("express-session");
const dotenv = require("dotenv");
const initDatabase = require("./database/initDB");

dotenv.config();
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 5000;

// Serve favicon
app.use(favicon(path.join(__dirname, "public", "favicon.ico")));

// Serve static assets
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

// Session middleware.
app.use(
  session({
    secret: process.env.SECRET, // Consider moving this to .env in production.
    resave: false,
    saveUninitialized: true,
  })
);

// Routes
app.use("/", require("./routes/auth"));
app.use("/", require("./routes/applicationRoutes"));

initDatabase();

app.listen(PORT, () => {
  console.log(`Express App running - listening on port ${PORT}!`);
});
