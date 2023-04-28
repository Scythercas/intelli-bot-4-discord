const express = require("express");
const errorhandler = require("errorhandler");
const bodyParser = require("body-parser");
const { Client, Events, GatewayIntentBits } = require("discord.js");
require("dotenv").config({ debug: true });
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
  ],
});
const DISCORD_TOKEN = process.env.TOKEN;

const app = express();
// APIサーバを起動するポート番号
const port = 3000;

// JSONリクエストを解析するためのミドルウェアを設定する
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello world!");
});

app.use(errorhandler());
app.use((req, res, next) => {
  const error = new Error("Cannot " + req.method + " " + req.path);
  error.status = 404;
  next(error);
});

// POSTリクエストを受け取った時の処理を記述する
app.post("/api/message", (req, res) => {
  // リクエストからメッセージを取得する
  const message = req.body.message;

  // Discord BOTでメッセージを送信する
  client.channels.cache.get("YOUR_DISCORD_CHANNEL_ID").send(message);

  // メッセージをレスポンスとして返す
  res.json({ message: message });
});

// Discord BOTが起動した時の処理を記述する
client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Discord BOTがメッセージを受信した時の処理を記述する
client.on("message", (msg) => {
  // メッセージがBOTから送信されたものであれば、無視する
  if (msg.author.bot) return;

  // チャットで送信されたメッセージを取得する
  const message = msg.content;

  // APIサーバにメッセージを送信する
  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: message }),
  };
  fetch("http://localhost:3000/api/message", options)
    .then((res) => res.json())
    .then((json) => console.log(json));
});

// Discord BOTにログインする
client.login(DISCORD_TOKEN);

// サーバーを起動する
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
