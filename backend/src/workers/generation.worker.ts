import { Worker, WorkerOptions } from "bullmq";
import { Job } from "bullmq";
import { redis } from "../config/redis.config";
import { processGenerateJob } from "../processors/generation.processor";

if (!redis) {
  throw new Error(
    "Redis connection is required for job queues. Please set REDIS_URL in your .env file.",
  );
}
export type Jobs = {
  assignmentId: string;
};

const workerOptions: WorkerOptions = {
  connection: redis,
  concurrency: 1,
  limiter: {
    max: 5,
    duration: 60000,
  },
};

const worker = new Worker<Jobs>(
  "generateJobs",
  async function worker(job: Job<Jobs>) {
    await processGenerateJob(job);
  },
  workerOptions,
);
