import express from "express";
import "dotenv/config";
import cors from "cors";
import helmet from "helmet";
import { pathToFileURL } from "node:url";
import connectdb from "./config/db.js";
import validateEnvironment from "./config/env.js";
import errorHandler from "./middleware/errorHandler.js";
import notFound from "./middleware/notFound.js";
import Task_Router from "./routes/task.route.js";
import User_Router from "./routes/user.route.js";
import Setup_Router from "./modules/setup/setup.routes.js";
import Auth_Router from "./modules/auth/auth.routes.js";
import Users_Router from "./modules/users/users.routes.js";
import Audit_Router from "./modules/audit/audit.routes.js";
import Ai_Router from "./modules/ai/ai.routes.js";
import { createAdminFromEnvironment } from "./modules/setup/setup.service.js";

const PORT = process.env.PORT || 2000;
const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (req, res) => {
  res.status(200).send({ success: true, data: { status: "ok" } });
});

app.get("/", (req, res) => {
  res.status(201).send({ status: 201, message: "Astral Backend home Api", suess: true });
});

app.use("/api/setup", Setup_Router);
app.use("/api/auth", Auth_Router);
app.use("/api/users", Users_Router);
app.use("/api/audit", Audit_Router);
app.use("/api/ai", Ai_Router);
app.use("/api", Task_Router);
app.use("/api", User_Router);
app.use(notFound);
app.use(errorHandler);

export { app };

const Startserver = async () => {
  validateEnvironment();
  await connectdb();
  await createAdminFromEnvironment();
  app.listen(PORT, () => {
    console.log("Server is Runing on Port:", PORT);
  });
};

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  Startserver();
}