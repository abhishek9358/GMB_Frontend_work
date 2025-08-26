import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gbp-blue-500 mb-4">404</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Page Not Found
          </h2>
          <p className="text-gray-600">
            Sorry, we couldn't find the page you're looking for.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            to="/"
            className="w-full bg-gbp-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-gbp-blue-600 transition-colors flex items-center justify-center space-x-2"
          >
            <Home className="w-4 h-4" />
            <span>Go to Dashboard</span>
          </Link>

          <button
            onClick={() => window.history.back()}
            className="w-full border border-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
}
