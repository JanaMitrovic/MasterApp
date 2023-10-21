import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { useUser } from './UserContext';

export function PrivateRoute({ element, ...props }) {
  const { user } = useUser();

  if (!user) {
    // If the user is not logged in, redirect them to the login page
    return <Navigate to="/login" />;
  }

  // If the user is logged in, render the protected route component
  return <Route {...props} element={element} />;
}
