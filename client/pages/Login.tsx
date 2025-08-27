import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Globe, Loader2, AlertCircle, CheckCircle } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Check for success/error params from OAuth callback
  useEffect(() => {
    const successParam = searchParams.get("success");
    const errorParam = searchParams.get("error");

    if (successParam === "true") {
      setSuccess(true);
      // Redirect to businesses page after a short delay
      setTimeout(() => {
        navigate("/businesses");
      }, 2000);
    } else if (errorParam) {
      setError(getErrorMessage(errorParam));
    }
  }, [searchParams, navigate]);

  const getErrorMessage = (errorParam: string) => {
    // If the error is already a formatted message, use it directly
    if (
      errorParam.includes("Google authentication failed") ||
      errorParam.includes("credentials")
    ) {
      return errorParam;
    }

    // Otherwise, map error codes to messages
    switch (errorParam) {
      case "auth_failed":
        return "Google authentication failed. Please check your Google OAuth credentials in the backend.";
      case "access_denied":
        return "Access was denied. Please grant the necessary permissions.";
      case "invalid_request":
        return "Invalid request. Please try again.";
      default:
        return errorParam || "An unexpected error occurred. Please try again.";
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);

      // Call your backend to get the Google OAuth URL
      const response = await fetch("/auth/google");

      if (!response.ok) {
        throw new Error("Failed to initiate authentication");
      }

      const data = await response.json();

      if (data.authUrl) {
        // Redirect to Google OAuth
        window.location.href = data.authUrl;
      } else {
        throw new Error("No authentication URL received");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Authentication Successful!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Redirecting you to your business dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="w-20 h-20 bg-gbp-blue-100 rounded-full flex items-center justify-center mx-auto">
            <Globe className="w-10 h-10 text-gbp-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Connect Your Google Business
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in with Google to manage your Business Profile listings
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Authentication Error
                </h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        <div>
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gbp-blue-600 hover:bg-gbp-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gbp-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Continue with Google</span>
              </div>
            )}
          </button>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            By continuing, you agree to let this application access your Google
            Business Profile data
          </p>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6">
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              What you'll be able to do:
            </h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• View all your business locations</li>
              <li>• Monitor verification status</li>
              <li>• Track profile completeness</li>
              <li>• Manage business information</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
