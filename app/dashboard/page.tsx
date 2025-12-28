import { auth } from "@/auth";
import { CaptureUrlForm } from "@/app/components/capture-url-form";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Submit Page
          </h1>
          <Link
            href="/jobs"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            View All Jobs
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <CaptureUrlForm />
        </div>
      </main>
    </div>
  );
}