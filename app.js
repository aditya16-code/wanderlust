if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const {MongoStore} = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const User = require("./models/user.js");
const ExpressError = require("./utils/ExpressError.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js"); // must use express.Router({ mergeParams: true })
const userRouter = require("./routes/user.js");

const app = express();

const dbUrl = process.env.ATLAS_URL;
const secret = process.env.SECRET;
const port = process.env.PORT || 8080;
const isProduction = process.env.NODE_ENV === "production";

if (!dbUrl || !secret) {
  console.error("Missing ATLAS_URL or SECRET in environment variables");
  process.exit(1);
}

// Needed for secure cookies when deployed behind a proxy (Render, Heroku, etc.)
if (isProduction) {
  app.set("trust proxy", 1);
}

// ---------- View engine & static ----------
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// ---------- Session ----------
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: { secret },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.log("error in mongo session store", err);
});

const sessionOptions = {
  store,
  secret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
  },
};

app.use(session(sessionOptions));
app.use(flash());

// ---------- Passport ----------
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ---------- Template locals (must come before routes) ----------
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// ---------- Routes ----------
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// ---------- 404 ----------
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

// ---------- Error handler ----------
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);

  const statusCode = err.statusCode || 500;
  if (!err.message) err.message = "Something Went Wrong";

  res.status(statusCode).render("listings/error.ejs", { err });
});

// ---------- Start: connect DB first, then listen ----------
async function main() {
  await mongoose.connect(dbUrl);
  console.log("connected to db");

  app.listen(port, () => {
    console.log(`server is listening on port ${port}`);
  });
}

main().catch((err) => {
  console.error("failed to start server", err);
  process.exit(1);
});