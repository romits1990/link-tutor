import { inngest } from "@/app/lib/inngest/client";
import { pusherServer } from "@/app/lib/pusher";

export const notificationCrawlCompleted = inngest.createFunction(
  { id: "process-crawl-completed" },
  { event: "notification/crawl-completed" },
  async ({ event, step }) => {
    const { jobId, userId } = event.data;

    await step.run("pusher-notify", async () => {
      // Notify only this specific user's private channel
      await pusherServer.trigger(`user-${userId}`, "job-complete", {
        jobId,
        status: "COMPLETED",
        message: "Your AI session is ready to launch!"
      });
    });
  }
);