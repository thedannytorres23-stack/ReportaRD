import { useState } from "react";
import { Navigate, Route, Routes } from "react-router";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import CreatePost from "./pages/CreatePost";
import CreateReport from "./pages/CreateReport";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Notifications from "./pages/Notifications";
import MapPage from "./pages/MapPage";
import People from "./pages/People";
import UserProfile from "./pages/UserProfile";


export default function App() {
  const [autenticado, setAutenticado] = useState(() => {
    return (
      localStorage.getItem("reportard_session") === "true"
    );
  });

  const autenticarUsuario = () => {
    localStorage.setItem("reportard_session", "true");
    setAutenticado(true);
  };

  const cerrarSesion = () => {
    localStorage.removeItem("reportard_session");
    setAutenticado(false);
  };

  const protegerRuta = (componente) => {
    return autenticado ? (
      componente
    ) : (
      <Navigate to="/login" replace />
    );
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={
          autenticado ? (
            <Navigate to="/" replace />
          ) : (
            <Login onLogin={autenticarUsuario} />
          )
        }
      />
      <Route
        path="/registro"
        element={
          autenticado ? (
            <Navigate to="/" replace />
          ) : (
            <Register onRegister={autenticarUsuario} />
          )
        }
      />

      <Route
        path="/"
        element={protegerRuta(
          <Home onLogout={cerrarSesion} />,
        )}
      />

      <Route
        path="/publicar"
        element={protegerRuta(<CreatePost />)}
      />

      <Route
        path="/reportar"
        element={protegerRuta(<CreateReport />)}
      />

      <Route
        path="/perfil"
        element={protegerRuta(<Profile />)}
      />

      <Route
        path="/editar-perfil"
        element={protegerRuta(<EditProfile />)}
      />

      <Route
        path="/personas"
        element={protegerRuta(<People />)}
      />


      <Route
        path="/usuario/:id"
        element={protegerRuta(<UserProfile />)}
      />

      <Route
        path="/notificaciones"
        element={protegerRuta(<Notifications />)}
      />

      <Route
        path="/mapa"
        element={protegerRuta(<MapPage />)}
      />

      <Route
        path="*"
        element={
          <Navigate
            to={autenticado ? "/" : "/login"}
            replace
          />
        }
      />
    </Routes>
  );
}