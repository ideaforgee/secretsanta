const db = require("../config/db.js");

// Get user wishlist
async function getUserWishlist(userId) {
  const query = `
    SELECT name AS wishName, link
    FROM wishList
    WHERE userId = ?`;

  try {
    const [results] = await db.query(query, [userId]);
    return results;
  } catch (err) {
    throw new Error(err.message);
  }
}

// Create or update wishlist
async function createUserWishlist(userId, wish, gameId) {
  const query = "INSERT INTO wishList (name, link, userId, gameId) VALUES (?, ?, ?, ?)";
  const values = [wish.productName, wish.productLink, userId, gameId];

  try {
    await db.query(query, values);
    return { message: "Wishlist created successfully." };
  } catch (err) {
    throw new Error(err.message);
  }
}

module.exports = { getUserWishlist, createUserWishlist };
