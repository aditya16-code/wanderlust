// init/addGeometry.js
require("dotenv").config();
const mongoose = require("mongoose");
const Listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const geocodingClient = mbxGeocoding({ accessToken: process.env.MAP_TOKEN });

async function run() {
  await mongoose.connect(process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust");

  // listings with no geometry or empty coordinates
  const listings = await Listing.find({
    $or: [
      { geometry: { $exists: false } },
      { "geometry.coordinates": { $exists: false } },
      { "geometry.coordinates": { $size: 0 } },
    ],
  });

  console.log(`Found ${listings.length} listings to fix`);

  for (const listing of listings) {
    try {
      const res = await geocodingClient
        .forwardGeocode({
          query: `${listing.location}, ${listing.country}`,
          limit: 1,
        })
        .send();

      const geometry = res.body.features[0]?.geometry;
      if (!geometry) {
        console.log(`No result for: ${listing.title}`);
        continue;
      }

      listing.geometry = geometry; // { type: "Point", coordinates: [lng, lat] }
      await listing.save();
      console.log(`Updated: ${listing.title}`);
    } catch (err) {
      console.error(`Failed: ${listing.title}`, err.message);
    }
  }

  await mongoose.connection.close();
}

run();