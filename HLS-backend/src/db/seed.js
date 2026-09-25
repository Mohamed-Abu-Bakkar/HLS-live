const fs = require("fs");
const path = require("path");
const { pool, query } = require("./index");

const sampleHotels = [
  {
    title: "The Grand Palace Luxury Resort",
    description:
      "Nestled in the heart of the city with breathtaking skyline views, Michelin-star dining, an infinity rooftop pool, and state-of-the-art spa amenities.",
    price: 350.0,
    latitude: 48.858844,
    longitude: 2.294351,
    filename: "hotel-grand-palace.svg",
    color1: "#1e3a8a",
    color2: "#3b82f6",
  },
  {
    title: "Sakura Boutique Inn & Onsen",
    description:
      "Traditional Japanese ryokan aesthetics blended with modern luxury. Features private natural hot spring baths and seasonal Kaiseki culinary courses.",
    price: 220.0,
    latitude: 35.676192,
    longitude: 139.650311,
    filename: "hotel-sakura-inn.svg",
    color1: "#831843",
    color2: "#ec4899",
  },
  {
    title: "Azure Coast Beach Villa",
    description:
      "Direct beachfront access with private white sand terrace, sunset cabanas, infinity plunge pool, and fresh oceanfront seafood grill.",
    price: 480.0,
    latitude: -8.409518,
    longitude: 115.188916,
    filename: "hotel-azure-coast.svg",
    color1: "#065f46",
    color2: "#10b981",
  },
  {
    title: "Metropolis Manhattan Suites",
    description:
      "Sleek contemporary suites located minutes from Central Park, Broadway theatres, high-end shopping, and vibrant urban nightlife.",
    price: 310.0,
    latitude: 40.758896,
    longitude: -73.98513,
    filename: "hotel-manhattan-suites.svg",
    color1: "#374151",
    color2: "#6b7280",
  },
  {
    title: "Alpine Peak Chalet & Spa",
    description:
      "Panoramic mountain vistas with ski-in ski-out access, cozy fireplace suites, heated alpine pool, and authentic fondue restaurant.",
    price: 290.0,
    latitude: 45.923697,
    longitude: 6.869433,
    filename: "hotel-alpine-chalet.svg",
    color1: "#701a75",
    color2: "#a855f7",
  },
  {
    title: "The Royal Thames Riverside Hotel",
    description:
      "Historic elegance overlooking the iconic river, featuring traditional high tea in the conservatory, private boat charters, and classic architecture.",
    price: 275.0,
    latitude: 51.507351,
    longitude: -0.127758,
    filename: "hotel-royal-thames.svg",
    color1: "#78350f",
    color2: "#d97706",
  },
  {
    title: "Desert Oasis Mirage Resort",
    description:
      "Spectacular architecture surrounded by golden dunes, offering desert stargazing tours, private plunge pools, and luxury wellness treatments.",
    price: 520.0,
    latitude: 25.204849,
    longitude: 55.270783,
    filename: "hotel-desert-oasis.svg",
    color1: "#9a3412",
    color2: "#f97316",
  },
  {
    title: "Harbour Breeze Waterfront Hotel",
    description:
      "Unmatched views of the Opera House and Harbour Bridge. Features chic rooftop cocktails, seafood fine dining, and harbor cruise concierge.",
    price: 340.0,
    latitude: -33.856784,
    longitude: 151.215297,
    filename: "hotel-harbour-breeze.svg",
    color1: "#155e75",
    color2: "#06b6d4",
  },
];

function createPlaceholderSvg(title, color1, color2) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#grad)" />
  <circle cx="400" cy="190" r="70" fill="rgba(255,255,255,0.15)" />
  <path d="M370 230 L370 170 L430 170 L430 230 Z M385 185 L395 185 L395 195 L385 195 Z M405 185 L415 185 L415 195 L405 195 Z M385 205 L395 205 L395 215 L385 215 Z M405 205 L415 205 L415 215 L405 215 Z" fill="#ffffff" />
  <text x="400" y="320" font-family="system-ui, sans-serif" font-size="28" font-weight="bold" fill="#ffffff" text-anchor="middle">${title}</text>
  <text x="400" y="360" font-family="system-ui, sans-serif" font-size="16" fill="rgba(255,255,255,0.85)" text-anchor="middle">Luxury Stays &amp; Exceptional Hospitality</text>
</svg>`;
}

async function initAndSeed() {
  const uploadsDir = path.join(__dirname, "..", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const schemaPath = path.join(__dirname, "init.sql"); //instead of connecting db and seeding once again, it joined the seeding schema to init.sql
  const schemaSql = fs.readFileSync(schemaPath, "utf8");

  console.log("Applying database schema...");
  await query(schemaSql);

  const countResult = await query("SELECT COUNT(*) AS total FROM hotels");
  const total = parseInt(countResult.rows[0].total, 10);

  if (total === 0) {
    console.log("Seeding initial hotels...");
    for (const h of sampleHotels) {
      const svgContent = createPlaceholderSvg(h.title, h.color1, h.color2);
      const filePath = path.join(uploadsDir, h.filename);
      fs.writeFileSync(filePath, svgContent, "utf8");

      const imageUrl = `/uploads/${h.filename}`;
      await query(
        `INSERT INTO hotels (title, description, price, latitude, longitude, image_url)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [h.title, h.description, h.price, h.latitude, h.longitude, imageUrl],
      );
    }
    console.log(`Successfully seeded ${sampleHotels.length} hotels.`);
  } else {
    console.log(`Database already has ${total} hotels. Skipping seed.`);
  }
}

if (require.main === module) {
  initAndSeed()
    .then(() => {
      console.log("DB init & seed completed successfully.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Error during DB init & seed:", err);
      process.exit(1);
    });
}

module.exports = { initAndSeed };
