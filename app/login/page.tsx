import SignIn from "@/app/components/sign-in";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
    const session = await auth();
    if( session?.user) {
        // If already authenticated, redirect to home
        redirect("/");
    }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome Back
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Sign in to your account to continue
            </p>
          </div>

          {/* Sign In Component */}
          <SignIn />

          {/* Footer */}
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p>
              Don't have an account?{" "}
              <a
                href="/signup"
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
              >
                Sign up
              </a>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>Secure login powered by Google authentication</p>
        </div>
      </div>
    </div>
  );
}
