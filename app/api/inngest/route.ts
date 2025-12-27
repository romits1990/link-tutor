import { serve } from "inngest/next";
import { 
  inngest, 
  processIngestion,
  processIndividualPage,
  notificationCrawlCompleted 
} from "@/app/lib/inngest";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [processIngestion, processIndividualPage, notificationCrawlCompleted],
});