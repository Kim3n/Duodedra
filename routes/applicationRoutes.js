const express = require("express");
const { ensureAuthenticated, ensureAdmin } = require("../middlewares/auth");
const { registerFont } = require("canvas");
const { UltimateTextToImage } = require("ultimate-text-to-image");
const path = require("node:path");
const router = express.Router();
const sql = require("../database/db");

// Register fonts before generating text
registerFont(path.join(__dirname, "../public/fonts/Oblivion.ttf"), {
  family: "Oblivion",
});

//Get a random letter
function getRandomLetter() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return letters[Math.floor(Math.random() * letters.length)];
}

// Function to generate 5 random letters (1 correct and 4 incorrect)
function generateOptions(correctLetter) {
  const options = [correctLetter];
  // Generate 4 random letters that are not the correct letter
  while (options.length < 5) {
    const randomLetter = getRandomLetter();
    if (!options.includes(randomLetter)) {
      options.push(randomLetter);
    }
  }
  options.sort(() => Math.random() - 0.5);
  return options;
}

//ROUTES

router.get("/learn", async (req, res) => {
  try {
    if (!req.session.rounds) {
      req.session.rounds = 1; // Initialize round count if not set
      req.session.correctCount = 0;
      req.session.xpUpdated = false; // Allow XP update for the next game
      req.session.history = []; // Initialize history array
    }
    const userRole = req.session.user ? req.session.user.role : null;

    // Stop the game after 10 rounds
    if (req.session.rounds > 10) {
      return res.redirect("/game-over"); // Stop and show game over screen
    }

    const correctLetter = getRandomLetter();
    const options = generateOptions(correctLetter);
    req.session.correctLetter = correctLetter;

    const textToImage = new UltimateTextToImage(correctLetter, {
      fontFamily: "Oblivion",
      // fontColor: "#000000",
      fontColor: "#ffffff",
      fontSize: 72,
      minFontSize: 10,
      lineHeight: 50,
      autoWrapLineHeightMultiplier: 1.2,
      margin: 20,
      marginBottom: 40,
      align: "center",
      valign: "middle",
      backgroundColor: "#00000000",
    });

    const imageBuffer = textToImage.render().toBuffer();
    const base64Image = imageBuffer.toString("base64");

    res.render("learn", {
      image: `data:image/png;base64,${base64Image}`,
      options: options,
      rounds: req.session.rounds,
      role: userRole,
    });
  } catch (error) {
    console.error("Error generating image:", error);
    res.status(500).send("Failed to generate image.");
  }
});

router.post("/check", (req, res) => {
  const userChoice = req.body.choice;
  const correctLetter = req.session.correctLetter;

  const isCorrect = userChoice === correctLetter;

  if (isCorrect) {
    req.session.correctCount = (req.session.correctCount || 0) + 1;
  }

  // Save the round result to history
  req.session.history.push({
    round: req.session.rounds,
    correctLetter: correctLetter,
    userChoice: userChoice,
    result: isCorrect ? "✅" : "❌",
  });

  res.json({ isCorrect, correctLetter });
});

router.post("/next-round", (req, res) => {
  if (!req.session.rounds) {
    req.session.rounds = 1;
  }

  req.session.rounds++;
  res.json({ round: req.session.rounds });
});

router.get("/restart", (req, res) => {
  req.session.rounds = 1;
  req.session.correctCount = 0;
  req.session.history = []; // Reset history
  req.session.xpUpdated = false; // Allow XP update for the next game
  req.session.correctLetter = null;
  res.redirect("/learn");
});
router.get("/game-over", async (req, res) => {
  const user = req.session.user; // Get user from session
  const correctCount = req.session.correctCount || 0;

  if (user) {
    try {
      // Fetch user from the database
      const users =
        await sql`SELECT * FROM users WHERE username = ${user.username}`;

      if (user && !req.session.xpUpdated) {
        let currentXP = Number(users[0].xp);
        let newXP = currentXP + correctCount;

        // Update XP in the database
        await sql`UPDATE users SET xp = ${newXP} WHERE username = ${user.username}`;

        // Insert XP transaction into xp_history (for last-week leaderboard)
        await sql`
                INSERT INTO xp_history (user_id, xp_gained)
                VALUES (${user.id}, ${correctCount})
              `;

        req.session.user.xp = newXP;
        req.session.xpUpdated = true;
      }
    } catch (error) {
      console.error("Database error:", error);
      return res.status(500).send("Internal Server Error");
    }
  }
  res.render("game-over", {
    message: "You've completed 10 rounds!",
    correctCount: correctCount,
    history: req.session.history || [],
    role: user ? user.role : null,
    xp: user ? user.xp : null,
  });
});
router.get("/leaderboard", async (req, res) => {
  try {
    // All-time leaderboard: Fetch top 10 users sorted by total XP
    const allTimeLeaderboard = await sql`
      SELECT username, xp FROM users ORDER BY xp DESC LIMIT 10
    `;

    // Last week's leaderboard: Fetch top 10 users by XP gained in the past 7 days
    const lastWeekLeaderboard = await sql`
      SELECT users.username, SUM(xp_history.xp_gained) AS total_xp
      FROM xp_history
      JOIN users ON xp_history.user_id = users.id
      WHERE xp_history.created_at >= NOW() - INTERVAL '7 days'
      GROUP BY users.username
      ORDER BY total_xp DESC
      LIMIT 10
    `;

    // Get the current user's role
    const userRole = req.session.user ? req.session.user.role : null;

    res.render("leaderboard", {
      allTimeLeaderboard,
      lastWeekLeaderboard,
      role: userRole,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
