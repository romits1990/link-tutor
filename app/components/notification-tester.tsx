"use client";

import { useEffect } from "react";
import Pusher from "pusher-js";

export default function NotificationTester({ userId }: { userId: string }) {
  useEffect(() => {
    // 1. Initialize Pusher Client
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    // 2. Subscribe to the specific user's channel
    const channel = pusher.subscribe(`user-${userId}`);

    // 3. Bind to the 'job-complete' event
    channel.bind("job-complete", (data: any) => {
      console.log("✅ Notification Received:", data);
      
      // Example action: Show a browser alert or update UI state
      alert(`Job ${data.jobId} is ${data.status}: ${data.message}`);
    });

    // Cleanup on unmount
    return () => {
      pusher.unsubscribe(`user-${userId}`);
      pusher.disconnect();
    };
  }, [userId]);

  return (
    <div className="p-4 border rounded shadow-sm">
      <h3 className="font-bold">Pusher Listener Active</h3>
      <p className="text-sm text-gray-500">Listening on channel: user-{userId}</p>
    </div>
  );
}