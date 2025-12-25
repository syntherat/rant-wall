import passport from "passport";
import bcrypt from "bcryptjs";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "./models/User.js";

function ensureEquippedDefaults(user) {
  if (!user) return user;

  if (!user.equipped) user.equipped = {};
  if (!user.equipped.rantTheme) user.equipped.rantTheme = "theme.midnight";
  if (!user.equipped.profileTheme) user.equipped.profileTheme = "profile.midnight";
  if (!user.equipped.nameGlow) user.equipped.nameGlow = "glow.none";
  if (!user.equipped.rantEffect) user.equipped.rantEffect = "effect.none";

  return user;
}



passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select(
      "username email ventEnergy equipped inventory cosmetic googleId"
    );
    done(null, user || false);
  } catch (e) {
    done(e);
  }
});


// Local strategy (email + password)
passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user || !user.passwordHash) return done(null, false, { message: "Invalid credentials" });

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return done(null, false, { message: "Invalid credentials" });

        ensureEquippedDefaults(user);
        await user.save();

        return done(null, user);
      } catch (e) {
        return done(e);
      }
    }
  )
);

// Google OAuth strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: "132424120816-6cmqpc8ecse2qib74kb53s4agaa4l08f.apps.googleusercontent.com",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const email = profile.emails?.[0]?.value?.toLowerCase() || null;

        // 1) If user exists by googleId
        let user = await User.findOne({ googleId });

        // 2) Else, link by email if same email already registered
        if (!user && email) user = await User.findOne({ email });

        // 3) Create if doesn't exist
        if (!user) {
          user = await User.create({
            username: profile.displayName?.slice(0, 24) || "Ranter",
            email: email || `noemail-${googleId}@google.local`,
            googleId,
            ventEnergy: 20
          });
        } else {
          // ensure googleId is linked
          if (!user.googleId) user.googleId = googleId;
          await user.save();
        }

        ensureEquippedDefaults(user);
        await user.save();

        return done(null, user);
      } catch (e) {
        return done(e);
      }
    }
  )
);
