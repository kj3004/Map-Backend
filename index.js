// server.js

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const API_KEY = "YOUR_API_KEY";
let locations = [];

app.post("/api/locations", (req, res) => {
  const location = req.body;
  locations.push(location);
  res.status(201).send();
});

app.get("/api/optimized-route", async (req, res) => {
  if (locations.length < 2) {
    return res.json({ route: locations });
  }

  try {
    const waypoints = locations
      .slice(1, -1)
      .map((loc) => `${loc.lat},${loc.lng}`)
      .join("|");
    const origin = `${locations[0].lat},${locations[0].lng}`;
    const destination = `${locations[locations.length - 1].lat},${
      locations[locations.length - 1].lng
    }`;

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&waypoints=${waypoints}&key=${API_KEY}`;
    const response = await axios.get(url);
    const route = response.data.routes[0].legs.flatMap((leg) =>
      leg.steps.map((step) => ({
        lat: step.end_location.lat,
        lng: step.end_location.lng,
      }))
    );

    res.json({ route });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching optimized route");
  }
});

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
