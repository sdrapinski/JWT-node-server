import express from "express";
import jwt from "jsonwebtoken";

const app = express();

//aplication.json

app.use(express.json());

app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Pass to next layer of middleware
  next();
});

const authMiddleware = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.sendStatus(401);
  }
  jwt.verify(token, ACCESS_TOKEN, (err, data) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = data;
    next();
  });
};

// process.env
const ACCESS_TOKEN = "dhsgfgsdhfvsgdfvhsdvfhsdfvts16267612vsgdfhsdfgsvdf";
const REFRESH_TOKEN = "ksodfkosdfksifsdnjfnsjdfnjsdnjsfkjdsfnskdnfksdkn";

const users = [
  { id: 23, name: "Szymon", email: "jakis@email.com" },
  { id: 13, name: "Adam", email: "adam@email.com" },
];

let refreshTokens = [];

app.get("/", (req, res) => {
  res.send("Witaj na stronie glownej");
});

app.get("/admin", authMiddleware, (req, res) => {
  res.send("Witaj w panelu admina");
});

app.post("/login", (req, res) => {
  // res.setHeader("Access-Control-Allow-Origin", "*");
  // res.setHeader("Access-Control-Allow-Methods", "POST");
  // res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  // res.setHeader("Access-Control-Allow-Credentials", true);

  const user = users.find((u) => u.email === req.body.email);
  if (!user) {
    return res.sendStatus(401); // nieatoryzowany
  }
  const payload = user;
  const token = jwt.sign(payload, ACCESS_TOKEN, { expiresIn: "3m" });
  const refreshToken = jwt.sign(payload, REFRESH_TOKEN);
  refreshTokens.push(refreshToken);

  res.json({ token, refreshToken });
});

app.post("/refresh-token", (req, res) => {
  const { token } = req.body;

  if (!refreshTokens.includes(token)) {
    return res.sendStatus(403);
  }
  jwt.verify(token, REFRESH_TOKEN, (err, data) => {
    if (err) {
      return res.sendStatus(403);
    }
    const payload = { id: data.id, name: data.name, email: data.email };
    const newAccessToken = jwt.sign(payload, ACCESS_TOKEN, {
      expiresIn: "3m",
    });
    res.json({ token: newAccessToken });
  });
});

app.delete("/logout", (req, res) => {
  const { refreshToken } = req.body;
  refreshTokens = refreshTokens.filter((t) => t !== refreshToken);
  res.sendStatus(204);
});

app.listen(8000, () => console.log("Serwer dziala"));
