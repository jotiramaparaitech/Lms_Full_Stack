import { useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useUser();
  const role = user?.publicMetadata?.role;

  if (!user) return <Navigate to="/sign-in" replace />;
  if (!allowedRoles.includes(role))
    return <Navigate to="/unauthorized" replace />;

  return children;
};

export default ProtectedRoute;
