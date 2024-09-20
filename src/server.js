const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const shortid = require("shortid");
const fs = require("fs/promises");
const path = require("path");
const dbLocation = path.resolve("src", "data.json");

const app = express();

app.use(cors());
app.use(morgan());
app.use(express.json());

app.delete("/:id", async (req, res) => {
  const id = req.params.id;

  const data = await fs.readFile(dbLocation);
  const players = JSON.parse(data);

  const player = players.find((p) => p.id === id);

  if (!player) {
    return res.status(404).json({ message: "Player not found" });
  }

  const newPlayers = players.filter((player) => player.id !== id);
  await fs.writeFile(dbLocation, JSON.stringify(newPlayers));

  res.status(203).send();
});

app.put("/:id", async (req, res) => {
  const id = req.params.id;

  const data = await fs.readFile(dbLocation);
  const players = JSON.parse(data);
  let player = players.find((p) => p.id === id);

  if (!player) {
    player = {
      ...req.body,
      id: shortid.generate(),
    };

    players.push(player);
  } else {
    const { name, country, rank } = req.body;

    player.name = name;
    player.country = country;
    player.rank = rank;
  }

  await fs.writeFile(dbLocation, JSON.stringify(players));
  res.status(200).json(player);
});

app.patch("/:id", async (req, res) => {
  const id = req.params.id;

  const data = await fs.readFile(dbLocation);
  const players = JSON.parse(data);
  const player = players.find((p) => p.id === id);

  if (!player) return res.status(404).json({ message: "Player not found" });

  const { name, country, rank } = req.body;

  player.name = name || player.name;
  player.country = country || player.country;
  player.rank = rank || player.rank;

  await fs.writeFile(dbLocation, JSON.stringify(players));
  res.status(200).json(player);
});

app.get("/:id", async (req, res) => {
  const id = req.params.id;

  const data = await fs.readFile(dbLocation);
  const players = JSON.parse(data);

  const player = players.find((p) => p.id === id);

  if (!player) {
    return res.status(404).json({ message: "Player not found" });
  }

  res.set("Cache-Control", "public, max-age=300");
  res.status(200).json(player);
});

app.post("/", async (req, res) => {
  const player = {
    ...req.body,
    id: shortid.generate(),
  };

  const dbLocation = path.resolve("src", "data.json");

  const data = await fs.readFile(dbLocation);
  const players = JSON.parse(data);

  players.push(player);

  await fs.writeFile(dbLocation, JSON.stringify(players));
  res.status(201).json(player);
});

app.get("/", async (req, res) => {
  const data = await fs.readFile(dbLocation);
  const players = JSON.parse(data);

  res.set("Cache-Control", "public, max-age=300");
  res.status(200).json(players);
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`localhost:${port}`);
});
