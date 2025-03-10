const sql = require("./db.js");

async function getMessages() {
  try {
    const messages =
      await sql`SELECT * FROM messages WHERE flagged = FALSE ORDER BY added DESC;`;
    return messages;
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
}

async function getAllMessages() {
  try {
    const messages = await sql`SELECT * FROM messages ORDER BY added DESC;`;
    return messages;
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
}

async function getMessageByID(id) {
  try {
    const message = await sql`SELECT * FROM messages WHERE id = ${id};`;
    return message[0];
  } catch (error) {
    console.error("Error fetching message by id:", error);
    return [];
  }
}

async function insertMessage(username, text, added) {
  try {
    await sql`INSERT INTO messages (username, text, added) VALUES (${username}, ${text}, ${added});`;
    return { success: true, message: "Message inserted successfully" };
  } catch (error) {
    console.error("Error inserting message:", error);
    return { success: false, message: "Failed to insert message" };
  }
}

async function removeMessage(id) {
  try {
    await sql`DELETE FROM messages WHERE id = ${id};`;
    return { success: true, message: "Message removed successfully" };
  } catch (error) {
    console.error("Error removing message:", error);
    return { success: false, message: "Failed to remove message" };
  }
}

async function flagMessage(id) {
  try {
    await sql`UPDATE messages SET flagged = TRUE WHERE id = ${id};`;
    return { success: true, message: "Message flagged successfully" };
  } catch (error) {
    console.error("Error flagging message:", error);
    return { success: false, message: "Failed to flag message" };
  }
}

module.exports = {};
