const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  const userExists = users.some((user) => user.username === username);

  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered" });
});

// Get the book list available in the shop
public_users.get("/", async (req, res) => {
  try {
    const bookList = await Promise.resolve(books);
    res.status(200).json(bookList);
  } catch (err) {
    res.status(500).json({ message: "Error fetching books", error: err });
  }
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", async (req, res) => {
  try {
    const isbn = req.params.isbn;
    const book = await Promise.resolve(books[isbn]);

    if (book) {
      return res.status(200).json(book);
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error retrieving book by ISBN", error: err });
  }
});

// Get book details based on author
public_users.get("/author/:author", async (req, res) => {
  try {
    const author = req.params.author;
    const filteredBooks = await Promise.resolve(
      Object.values(books).filter((book) => book.author === author)
    );

    if (filteredBooks.length > 0) {
      return res.status(200).json(filteredBooks);
    } else {
      return res
        .status(404)
        .json({ message: "No books found for the specified author" });
    }
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error retrieving book details based on author",
        error: err,
      });
  }
});

// Get all books based on title
public_users.get("/title/:title", async (req, res) => {
  try {
    const title = req.params.title;
    const filteredBooks = await Promise.resolve(
      Object.values(books).filter((book) => book.title === title)
    );

    if (filteredBooks.length > 0) {
      return res.status(200).json(filteredBooks);
    } else {
      return res
        .status(404)
        .json({ message: "No books found for the specified title" });
    }
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error retrieving book details based on title",
        error: err,
      });
  }
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book && book.reviews) {
    return res.status(200).json(book.reviews);
  } else {
    return res
      .status(404)
      .json({ message: "No reviews found for the specified book" });
  }
});

module.exports.general = public_users;
