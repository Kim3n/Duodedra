const express = require("express");
const { ensureAuthenticated, ensureAdmin } = require("../middlewares/auth");
const sql = require("../database/db");
const bcrypt = require("bcryptjs");

const router = express.Router();

// BOTH REGISTER AND LOGIN FORMS ARE HERE
router.get("/", (req, res) => {
  const userRole = req.session.user ? req.session.user.role : null;
  const message = req.session.message;
  const showOverlay = req.session.showOverlay;
  req.session.message = null;
  req.session.showOverlay = null;
  res.render("index", { message, showOverlay, role: userRole });
});

// User Dashboard - Only accessible to logged-in users
router.get("/dashboard", ensureAuthenticated, (req, res) => {
  res.render("dashboard", {
    username: req.session.user.username,
    role: req.session.user.role,
    xp: req.session.user.xp,
    message: req.session.message || "",
  });
  req.session.message = null;
});

// Admin Panel - Only accessible to admin users
router.get("/admin", ensureAuthenticated, ensureAdmin, (req, res) => {
  const userRole = req.session.user ? req.session.user.role : null;
  res.render("admin", { username: req.session.user.username, role: userRole });
});

// Logout route
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const users = await sql`SELECT * FROM users WHERE username = ${username}`;
  if (users.length === 0) {
    const userRole = req.session.user ? req.session.user.role : null;
    return res.render("index", {
      message: "Invalid username or password!",
      showOverlay: "Login",
      role: userRole,
    });
  }

  const user = users[0];
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const userRole = req.session.user ? req.session.user.role : null;
    return res.render("index", {
      message: "Invalid username or password!",
      showOverlay: "Login",
      role: userRole,
    });
  }

  req.session.user = {
    id: user.id,
    username: user.username,
    role: user.role,
    xp: user.xp,
  };
  res.redirect("/");
});

router.get("/login", async (req, res) => {
  const userRole = req.session.user ? req.session.user.role : null;
  return res.render("index", {
    message: "",
    showOverlay: "Login",
    role: userRole,
  });
});

router.get("/register", async (req, res) => {
  const userRole = req.session.user ? req.session.user.role : null;
  return res.render("index", {
    message: "",
    showOverlay: "Register",
    role: userRole,
  });
});

router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if username already exists
    const existingUsers =
      await sql`SELECT * FROM users WHERE username = ${username}`;
    if (existingUsers.length > 0) {
      const userRole = req.session.user ? req.session.user.role : null;
      return res.render("index", {
        message: "User already exists!",
        showOverlay: "Register",
        role: userRole,
      });
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user with default role "user"
    await sql`
      INSERT INTO users (username, password, role)
      VALUES (${username}, ${hashedPassword}, 'user')
    `;
    req.session.message = "You can now login.";
    req.session.showOverlay = "Login";
    // Redirect to login after successful registration
    res.redirect("/");
  } catch (err) {
    console.error("Error registering user:", err);
    const userRole = req.session.user ? req.session.user.role : null;
    res.render("index", {
      message: "Error registering user. Please try again!",
      showOverlay: "Register",
      role: userRole,
    });
  }
});

router.post("/update-password", ensureAuthenticated, async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const user = req.session.user;

  if (!user) {
    return res
      .status(401)
      .send("You must be logged in to change your password.");
  }

  try {
    // Get user's current password from the database
    const users = await sql`SELECT password FROM users WHERE id = ${user.id}`;

    if (users.length === 0) {
      return res.status(404).send("User not found.");
    }

    const isMatch = await bcrypt.compare(oldPassword, users[0].password);
    if (!isMatch) {
      return res.render("dashboard", {
        message: "Old password is incorrect.",
        username: user.username,
        role: user.role,
        xp: user.xp,
      });
    }

    if (newPassword !== confirmPassword) {
      return res.render("dashboard", {
        message: "New passwords do not match.",
        username: user.username,
        role: user.role,
        xp: user.xp,
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in database
    await sql`UPDATE users SET password = ${hashedPassword} WHERE id = ${user.id}`;

    return res.render("dashboard", {
      message: "Password updated successfully!",
      username: user.username,
      role: user.role,
      xp: user.xp,
    });
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
