import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  isAdmin: boolean;
  redirectPath?: string;
}

const ProtectedRoute = ({
  isAdmin,
  redirectPath = '/'
}: ProtectedRouteProps) => {

  if (!isAdmin) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;