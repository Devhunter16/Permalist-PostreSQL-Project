import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import pg from "pg";

const app = express();
const port = 3000;

// Telling our app we're going to be using a .env file
dotenv.config();

const db = new pg.Client({
  user: process.env.DB_USER,
  host: "localhost",
  database: "permalist",
  password: process.env.DB_PASSWORD,
  port: process.env.DEV_PORT,
});

// Connecting to the db
db.connect()
  .then(() => console.log('Connected to the database'))
  .catch(err => console.error('Error connecting to the database', err));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Initializing our array of items
let items = [];

app.get("/", async (req, res) => {
  // Resetting the "items" array so we can populate it with the latest table data
  items = [];
  // Getting the id and title columns of all items in our "items" table and sorting
  // them by their id numbers
  const result = await db.query("SELECT id, title FROM items ORDER BY id;");
  // Pushing each item into the empty "items" array
  result.rows.forEach((item) => {
    items.push(item);
  });
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
});

app.post("/add", async (req, res) => {
  // Getting the input from the "New Item" form field and storing it in "item"
  const item = req.body.newItem;

  // Inserting "item" into our items table
  try {
    await db.query(
      "INSERT INTO items (title) VALUES ($1);",
      [item]
    );
    // Redirecting to our home page
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  };
});

app.post("/edit", async (req, res) => {
  const updatedItemId = req.body.updatedItemId;
  const updatedItemTitle = req.body.updatedItemTitle;
  // Updating a table entry
  try {
    await db.query(
      "UPDATE items SET title = $1 WHERE id = $2;",
      [updatedItemTitle, updatedItemId]
    );
    // Redirecting to our home page
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  };
});

app.post("/delete", async (req, res) => {
  const deleteItemId = req.body.deleteItemId;
  console.log(deleteItemId);

  try {
    await db.query(
      "DELETE FROM items WHERE id = $1;",
      [deleteItemId]
    );
    // Redirecting to our home page
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  };

});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});