import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTE_PATH } from '../constants/secretSantaConstants';
import { GAME_ID_KEY } from '../constants/appConstant';

export const ProtectedRoute = ({ element }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to={ROUTE_PATH.LOGIN} replace />;
  }

  return element;
};

export const ProtectedGamedRoute = ({ element }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to={ROUTE_PATH.LOGIN} replace />;
  }

  if (!localStorage.getItem(GAME_ID_KEY)) {
    return <Navigate to={ROUTE_PATH.DASHBOARD} replace />;
  }

  return element;
};
