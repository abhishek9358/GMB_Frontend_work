import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { checkAuthStatus } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const success = searchParams.get("success");
      const error = searchParams.get("error");

      console.log("Auth callback received:", { success, error });

      if (success === "true") {
        // Authentication was successful, check auth status and redirect
        console.log("Authentication successful, checking status...");
        await checkAuthStatus();
        navigate("/businesses");
      } else if (error) {
        // Authentication failed, redirect to login with error
        console.log("Authentication failed:", error);
        let errorMessage = "Authentication failed";

        switch (error) {
          case "auth_failed":
            errorMessage =
              "Google authentication failed. Please check your Google OAuth credentials.";
            break;
          case "access_denied":
            errorMessage =
              "Access was denied. Please grant the necessary permissions.";
            break;
          case "invalid_request":
            errorMessage = "Invalid authentication request.";
            break;
          default:
            errorMessage = `Authentication error: ${error}`;
        }

        navigate(`/login?error=${encodeURIComponent(errorMessage)}`);
      } else {
        // No clear indication, redirect to login
        console.log("No auth parameters found, redirecting to login");
        navigate("/login");
      }
    };

    handleCallback();
  }, [searchParams, navigate, checkAuthStatus]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="w-20 h-20 bg-gbp-blue-100 rounded-full flex items-center justify-center mx-auto">
          <Loader2 className="w-10 h-10 text-gbp-blue-600 animate-spin" />
        </div>
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          Processing Authentication
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Please wait while we complete your sign-in...
        </p>
      </div>
    </div>
  );
}
