import { Worker, WorkerOptions } from "bullmq";
import { Job } from "bullmq";
import { prisma } from "../config/db.config";
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

worker.on("failed", async (job, err) => {
  if (!job) return;

  const { assignmentId } = job.data;
  console.error(
    `Job ${job.id} for assignment ${assignmentId} failed after ${job.attemptsMade} attempts:`,
    err,
  );

  try {
    await prisma.assignment.update({
      where: { id: assignmentId },
      data: { status: "FAILED" },
    });
  } catch (dbError) {
    console.error("Failed to update assignment status after job failure:", dbError);
  }
});
