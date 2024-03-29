import "dotenv/config";
import cors from "cors";
import morgan from "morgan";
import express from "express";
import uuid from "uuid";
import { LocalStorage } from "node-localstorage";
import path from "path";
import { fileURLToPath } from "url";

import courseRouter from "./routes/courses.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded());
app.use(assignId);
app.use(cors());
const PORT = process.env.PORT || 4000;

if (process.env.NODE_ENV == "development") {
  var BASE_URL = "http://localhost";
  morgan.token("host", function (req, res) {
    return req.hostname;
  });
  morgan.token("id", function getId(req) {
    return req.id;
  });
  app.use(
    morgan(
      ":id :method :host :status :res[content-length] :date[web] :response-time ms"
    )
  );
} else {
  var BASE_URL = process.env.BASE_URL;
}
function assignId(req, res, next) {
  req.id = uuid.v4();
  next();
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
var localStorage = new LocalStorage("./scratch");

app.get("/", function (req, res) {
  res.send("Hello World!");
});
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "Public", "login.html"));
});

app.post("/login", (req, res) => {
  const userName = "john";
  const passWord = "password";
  const username = req.body.username;
  const password = req.body.password;
  console.log(req.body.username);
  if (!username || !password) {
    return res.status(400).send("Please provide Username & Password!");
  }

  if (username !== userName || password !== passWord) {
    return res
      .status(400)
      .send("Access denied - Password or Username is incorrect!");
  }

  localStorage.setItem("loggedIn", "OK");
  res.sendFile(path.join(__dirname, "Public", "node-course.html"));
});

app.get("/node-course", (req, res) => {
  const loggedIn = localStorage.getItem("loggedIn");
  if (loggedIn === "OK") {
    res.sendFile(path.join(__dirname, "Public", "node-course.html"));
  } else {
    res.sendFile(path.join(__dirname, "Public", "login.html"));
  }
});
app.use("/api/courses", courseRouter);
app.listen(PORT, () =>
  console.log(`Course Server listening on ${BASE_URL}:${PORT}`)
);
