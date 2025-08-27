import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";

export default function AuthCallback() {
  const { checkAuthStatus } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        const state = urlParams.get("state");
        const error = urlParams.get("error");

        if (error) {
          setStatus("error");
          setError(`Authentication failed: ${error}`);
          return;
        }

        if (!code) {
          setStatus("error");
          setError("No authorization code received");
          return;
        }

        // Exchange code for tokens
        const response = await fetch("/api/auth/callback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code, state }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Authentication failed");
        }

        const data = await response.json();

        // Store tokens and user data
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("user_data", JSON.stringify(data.user));

        // Update auth context
        await checkAuthStatus();

        setStatus("success");

        // Redirect after a short delay
        setTimeout(() => {
          const redirectTo = localStorage.getItem("auth_redirect") || "/";
          localStorage.removeItem("auth_redirect");
          window.location.href = redirectTo;
        }, 2000);
      } catch (err) {
        console.error("Auth callback error:", err);
        setStatus("error");
        setError(err instanceof Error ? err.message : "Authentication failed");
      }
    };

    handleCallback();
  }, [checkAuthStatus]);

  const redirectToLogin = () => {
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Completing Sign In
          </h1>

          {status === "loading" && (
            <div className="space-y-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gbp-blue-600"></div>
              <p className="text-gray-600">Processing authentication...</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  Authentication successful! Redirecting to dashboard...
                </AlertDescription>
              </Alert>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>

              <button
                onClick={redirectToLogin}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gbp-blue-600 hover:bg-gbp-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gbp-blue-500"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
