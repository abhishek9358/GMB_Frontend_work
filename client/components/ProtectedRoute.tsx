import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to login, preserving the intended destination
      navigate('/login', { 
        state: { from: location.pathname } 
      });
    }
  }, [isAuthenticated, isLoading, navigate, location]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-gbp-blue-500" />
          <span className="text-gray-600">Checking authentication...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // This will be handled by the useEffect redirect
    return null;
  }

  return <>{children}</>;
}
