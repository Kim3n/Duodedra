// Middlewares for authentication and authorization
const ensureAuthenticated = (req, res, next) => {
  if (!req.session.user) {
    req.session.message = "You need to be logged in for that.";
    req.session.showOverlay = "Login";
    return res.redirect("/"); // Redirect to login if not logged in
  }
  next(); // User is logged in, continue
};

const ensureAdmin = (req, res, next) => {
  if (!req.session.user) {
    req.session.message = "You don't have access to that";
    req.session.showOverlay = "Login";
    return res.redirect("/"); // Redirect to login if not logged in
  }
  if (req.session.user.role !== "admin") {
    return res.status(403).send("Access Denied. Admins only."); // Block non-admin users
  }
  next(); // User is an admin, continue
};

module.exports = { ensureAuthenticated, ensureAdmin };
