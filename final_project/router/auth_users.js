const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return users.some((user) => user.username === username);
};

const authenticatedUser = (username, password) => {
  //returns boolean
  //write code to check if username and password match the one we have in records.
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  const user = users.find(
    (user) => user.username === username && user.password === password
  );
  if (!user) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  req.session.username = username;

  // Generate JWT token
  const token = jwt.sign({ username }, "fingerprint_customer", {
    expiresIn: "1h",
  });

  req.session.token = token;

  console.log("User logged in, session data:", req.session);

  return res.status(200).json({ message: "Login successful", token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.query;
  const username = req.session.username;

  if (!username) {
    return res
      .status(401)
      .json({ message: "Unauthorized: Please log in to post a review" });
  }

  const book = books[isbn];
  if (!book) {
    return res.status(404).json({
      message: `Book with ISBN ${isbn} not found`,
    });
  }

  if (!book.reviews) {
    book.reviews = {};
  }

  const action = book.reviews[username] ? "updated" : "added";
  book.reviews[username] = review;

  return res.status(200).json({
    message: `Review successfully ${action}`,
    reviews: book.reviews,
  });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const username = req.session.username;

  if (!username) {
    return res
      .status(401)
      .json({ message: "Unauthorized: Please log in to delete a review" });
  }

  const book = books[isbn];
  if (!book) {
    return res
      .status(404)
      .json({ message: `Book with ISBN ${isbn} not found` });
  }

  if (!book.reviews || !book.reviews[username]) {
    return res.status(404).json({ message: "No review found for this user" });
  }

  delete book.reviews[username];

  return res.status(200).json({
    message: "Review deleted successfully",
    reviews: book.reviews,
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
