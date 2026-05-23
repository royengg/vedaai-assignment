import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { authRouter } from "./routes/auth.routes";
import { assignmentRouter } from "./routes/assignment.route";
import cors from "cors";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.use("/api/auth", authRouter);
app.use("/api/assignment", assignmentRouter);

app.listen(3001, () => {
  console.log("server is running on port 3001");
});
