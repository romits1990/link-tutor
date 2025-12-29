import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import ChatInterface from '@/app/components/chat-interface';
import { verifyJobOwnership } from '@/app/lib/job-verification';

interface PageProps {
  searchParams: Promise<{ jobId?: string }>;
}

export default async function ChatPage({ searchParams }: PageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const params = await searchParams;
  const jobId = params.jobId;

  if (!jobId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">Error</h1>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Job ID is required</p>
          <a
            href="/jobs"
            className="mt-6 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Back to Jobs
          </a>
        </div>
      </div>
    );
  }

  // Verify job ownership on the server
  try {
    await verifyJobOwnership(jobId, session.user.id);
  } catch (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">Error</h1>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            Job not found or does not belong to you
          </p>
          <a
            href="/jobs"
            className="mt-6 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Back to Jobs
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <ChatInterface jobId={jobId} />
    </div>
  );
}
