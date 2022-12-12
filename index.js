import express from "express";
import jwt from "jsonwebtoken";

const app = express();

//aplication.json

app.use(express.json());

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
  const user = users.find((u) => u.email === req.body.email);
  if (!user) {
    return res.sendStatus(401); // nieatoryzowany
  }
  const payload = user;
  const token = jwt.sign(payload, ACCESS_TOKEN, { expiresIn: "15s" });
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
      expiresIn: "15s",
    });
    res.json({ token: newAccessToken });
  });
});

app.delete("/logout", (req, res) => {
  const { refreshToken } = req.body;
  refreshTokens = refreshTokens.filter((t) => t !== refreshToken);
  res.sendStatus(204);
});

app.listen(3000, () => console.log("Serwer dziala"));
