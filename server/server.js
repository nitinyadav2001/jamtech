import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import apiRoutes from "./src/routes/index.js";
import morgan from "morgan";
import { allowedOrigins } from "./src/config/allowedOrigins.js";
import sessionMiddleware from "./src/middlewares/rbac/sessionMiddleware.js";

dotenv.config();
const PORT = process.env.PORT || 3000;

const app = express();

app.use(sessionMiddleware);

app.use(morgan("dev"));

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api", apiRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
