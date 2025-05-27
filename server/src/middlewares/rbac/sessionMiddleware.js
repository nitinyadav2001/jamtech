import session from "express-session";
import pgSession from "connect-pg-simple";
import { Pool } from "pg";

const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const sessionMiddleware = session({
  store: new (pgSession(session))({
    pool: pgPool,
    tableName: "Session",
  }),
  secret: process.env.SESSION_SECRET || "your-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  },
});

export default sessionMiddleware;
