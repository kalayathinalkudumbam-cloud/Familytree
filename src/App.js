import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet, Navigate } from "react-router-dom";
import LandingPage from './pages/LandingPage/LandingPage';
import LoginPage from './pages/LoginPage/LoginPage';
import HomePage from './pages/HomePage/homepage';
import History from './pages/HistoryPage/Historypage';
import MemberList from './pages/MemberList/memberlist';
import GalleryPage from './pages/Gallery/gallery';
import AboutPage from './pages/AboutPage/about';
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider, useAuth } from './context/AuthContext';
import "./App.css"

function App() {
  const Layout = () => {
    return (
      <div className="app">
        <Outlet />
      </div>
    );
  };


  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: "/",
          element: <LoginPage />,
        },
        {
          path: "/homepage",
          element: <HomePage />,
        },
        {
          path: "/familytree",
          element: <LandingPage />,
        },
        {
          path: "/History",
          element: <History />,
        },
        {
          path: "/MemberList",
          element: <MemberList />,
        },
        {
          path: "/gallery",
          element: <GalleryPage />,
        },
        {
          path: "/aboutpet",
          element: <AboutPage />,
        },

      ],
    },
  ]);

  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <ToastContainer />
    </AuthProvider>
  );
}

export default App;
