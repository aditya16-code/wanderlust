# Wanderlust

An Airbnb-inspired web app where users can browse, list, and review stays around the world. Built with Node.js, Express, and MongoDB.

**Live demo:** _add  https://wanderlust-g6mg.onrender.com/listings?category=Rooms

## Features

- User signup, login, and logout (Passport.js, local strategy)
- Create, edit, and delete listings with image uploads (Cloudinary)
- Map location for each listing (Mapbox geocoding)
- Reviews on listings, with ownership checks so users only edit their own content
- Server-side validation with Joi
- Flash messages for user feedback
- Sessions stored in MongoDB

## Tech Stack

- **Backend:** Node.js, Express 5
- **Database:** MongoDB with Mongoose
- **Auth:** Passport.js, passport-local-mongoose
- **Views:** EJS, ejs-mate, Bootstrap 5
- **Uploads:** Multer, Cloudinary
- **Maps:** Mapbox SDK
- **Validation:** Joi

## Project Structure

```
controller/   Request handlers (listings, reviews, users)
init/         Database seed scripts and sample data
models/       Mongoose schemas
routes/       Express routes
views/        EJS templates
public/       Static assets (CSS, JS, images)
utils/        Helpers and error handling
app.js        App entry point
middleware.js Auth and validation middleware
schema.js     Joi validation schemas
```

## Getting Started

### Prerequisites

- Node.js
- A MongoDB database (local or MongoDB Atlas)
- Cloudinary and Mapbox accounts

### Installation

```bash
git clone https://github.com/aditya16-code/wanderlust.git
cd wanderlust
npm install
```

### Environment variables

Create a `.env` file in the project root:

```
ATLASDB_URL=your_mongodb_connection_string
SECRET=your_session_secret
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret
MAP_TOKEN=your_mapbox_access_token
```

### Run

```bash
node app.js
```

Then open `http://localhost:8080`.

To load sample listings, run `node init/index.js`.

## Future Improvements

- Search and filters for listings
- Booking system
- AI-powered trip suggestions

## Author

Aditya, [GitHub](https://github.com/aditya16-code)
