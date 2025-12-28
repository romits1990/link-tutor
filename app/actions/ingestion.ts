'use server';

import { auth, signUserId } from '@/auth';
import { redirect } from 'next/navigation';

export async function submitUrl(pageUrl: string) {
  // Verify authentication first
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const signedUserId = signUserId(session.user.id);

  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/ingestion/jobs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Pass signed userId that API can verify
      'X-User-Id': signedUserId,
    },
    body: JSON.stringify({ pageUrl }),
  });

  if (!response.ok) {
    let errorMessage = 'Failed to submit URL';
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch {
      // Response body might not be JSON, use status text as fallback
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  
  // Redirect to dashboard with jobId
  redirect(`/dashboard?jobId=${data.jobId}`);
}
