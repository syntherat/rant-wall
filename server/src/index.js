import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";
import passport from "passport";

import "./passport.js";
import authRoutes from "./routes/auth.routes.js";
import rantRoutes from "./routes/rants.routes.js";
import meRoutes from "./routes/me.routes.js";
import storeRoutes from "./routes/store.routes.js";

dotenv.config();

const app = express();

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

const isProd = process.env.NODE_ENV === "production";

// CORS with credentials (cookies)
const allowedOrigins = [
  process.env.CLIENT_ORIGIN,          // set differently in dev vs prod
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // allow server-to-server / curl requests (no Origin header)
      if (!origin) return cb(null, true);

      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

// Session stored in MongoDB
app.set("trust proxy", 1);
app.use(
  session({
    name: "rw.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,

    cookie: {
      httpOnly: true,
      secure: isProd,                 // ✅ true on Render (https)
      sameSite: isProd ? "none" : "lax", // ✅ cross-site cookie support in prod
      maxAge: 1000 * 60 * 60 * 24 * 14,
    },

    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
      // optional but nice:
      ttl: 14 * 24 * 60 * 60, // seconds
    }),
  })
);


// Passport
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => res.json({ ok: true, name: "Rant Web API" }));

app.use("/api/auth", authRoutes);
app.use("/api/rants", rantRoutes);
app.use("/api/me", meRoutes);
app.use("/api/store", storeRoutes);

const PORT = process.env.PORT || 8080;

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Mongo connected");
  app.listen(PORT, () => console.log(`✅ Server on http://localhost:${PORT}`));
})();
