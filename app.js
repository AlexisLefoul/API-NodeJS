const rateLimit = require("express-rate-limit");
const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();
const port = 5000;

const dbName = "" // Mettre le nom de la base de données à utiliser 
const dbUser = "" // Mettre le nom de l'utilisateur à utiliser 
const dbUserPassword = "" // Mettre le mot de passe de l'utilisateur à utiliser 

const pool = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  user: dbUser,
  password: dbUserPassword,
  database: dbName,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 90, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Parsing middleware
app.use(express.urlencoded({ extended: true })); // New
// Parse application/json
app.use(express.json()); // New
app.use(
  cors({
    origin: "*",
  })
);
// Apply the rate limiting middleware to API calls only
app.use("/", apiLimiter);

// MySQL Code goes here
app.get("/", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    connection.query("SELECT * from data", (err, rows) => {
      connection.release(); // return the connection to pool
      if (!err) {
        res.send(rows);
      } else {
        console.log(err);
      }
    });
  });
});

app.get("/:id", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    connection.query(
      "SELECT * FROM data WHERE id = ?",
      [req.params.id],
      (err, rows) => {
        connection.release(); // return the connection to pool
        if (!err) {
          res.send(rows);
        } else {
          console.log(err);
        }

        console.log("The data from data table are: \n", rows);
      }
    );
  });
});

// Listen on enviroment port or 5000
app.listen(port);
