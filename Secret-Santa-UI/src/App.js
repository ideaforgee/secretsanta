import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AlertProvider } from './context/AlertContext';
import { LoadingProvider } from "./context/LoadingContext";
import { useLoading } from './context/LoadingContext';
import { ProtectedRoute, ProtectedGamedRoute } from './components/ProtectedRoute';
import AlertComponent from './components/Alert/AlertComponent';
import Spinner from './pages/spinner/spinner';
import LoginPage from './pages/auth/login/LoginPage';
import RegisterPage from './pages/auth/register/RegisterPage';
import HomePage from './pages/HomePage';
import SecretSantaChat from './pages/SecretSantaChat';
import Dashboard from "./pages/dashboard/Dashboard";
import WishlistPage from './pages/wishlist/WishlistPage';
import GamePlay from '../src/pages/join-game/GamePlay';
import GameStatus from './pages/game-status/GameStatus';
import { setupInterceptors } from './services/axionsInstance';
import { ROUTE_PATH } from './constants/secretSantaConstants';
import ResetPassword from './pages/auth/reset-password/ResetPassword';
import ForgotPassword from './pages/auth/forget-password/ForgetPassword';
import "./App.css";
import BasePage from './pages/base-page/BasePage';
import GameZone from './pages/game-zone/GameZone';
import GameAssist from './pages/game-assist/GameAssist';
import MasterMind from './pages/master-mind/MasterMind';


const App = () => {
  const { startLoading, stopLoading } = useLoading();

  useEffect(() => {
    setupInterceptors(startLoading, stopLoading);
  }, [startLoading, stopLoading]);

  return (
    <LoadingProvider>
      <AlertProvider>
        <Router>
          <AuthProvider>
            <Spinner />
            <AlertComponent />
            <Routes>
              <Route path={ROUTE_PATH.DEFAULT} element={<HomePage />} />
              <Route path={ROUTE_PATH.LOGIN} element={<LoginPage />} />
              <Route path={ROUTE_PATH.FORGET_PASSWORD} element={<ForgotPassword />} />
              <Route path={ROUTE_PATH.RESET_PASSWORD} element={<ResetPassword />} />
              <Route path={ROUTE_PATH.REGISTER} element={<RegisterPage />} />
              <Route
                path={ROUTE_PATH.DASHBOARD}
                element={<ProtectedRoute element={<Dashboard />} />}
              />
              <Route
                path={ROUTE_PATH.GAME}
                element={<ProtectedGamedRoute element={<GamePlay />} />}
              />
              <Route
                path={ROUTE_PATH.WISHLIST}
                element={<ProtectedGamedRoute element={<WishlistPage />} />}
              />
              <Route
                path={ROUTE_PATH.CHAT}
                element={<ProtectedGamedRoute element={<SecretSantaChat />} />}
              />
              <Route
                path={ROUTE_PATH.GAME_STATUS}
                element={<ProtectedGamedRoute element={<GameStatus />} />}
              />
              <Route
                path={ROUTE_PATH.FUN_ZONE}
                element={<ProtectedRoute element={<BasePage />} />}
              />
              <Route
                path={ROUTE_PATH.GAME_ZONE}
                element={<ProtectedRoute element={<GameZone />} />}
              />
              <Route
                path={ROUTE_PATH.GAME_ASSIST}
                element={<ProtectedRoute element={<GameAssist />} />}
              />
              <Route
                path={ROUTE_PATH.MASTER_MIND}
                element={<ProtectedRoute element={<MasterMind />} />}
              />
            </Routes>
          </AuthProvider>
        </Router>
      </AlertProvider>
    </LoadingProvider>
  );
};


export default App;
