import { useState } from "react";
import { Navigate, Route, Routes } from "react-router";
import BottomNav from "./components/BottomNav";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import CreatePost from "./pages/CreatePost";
import CreateReport from "./pages/CreateReport";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Notifications from "./pages/Notifications";
import MapPage from "./pages/MapPage";
import SearchPage from "./pages/SearchPage";
import Communities from "./pages/Communities";
import People from "./pages/People";
import UserProfile from "./pages/UserProfile";
import CommunityDetail from "./pages/CommunityDetail";
import Messages from "./pages/Messages";
import ContentDetail from "./pages/ContentDetail";
import DesktopChrome from "./components/DesktopChrome";
import Live from "./pages/Live";

export default function App() {
  const [autenticado, setAutenticado] = useState(() => {
    return localStorage.getItem("reportard_session") === "true";
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
    return autenticado ? componente : <Navigate to="/login" replace />;
  };

  return (
    <>
      <div
        data-reportard-main
        className={
          autenticado
            ? "min-h-screen bg-slate-950 pb-24 lg:pb-0 lg:pl-72 xl:pr-80"
            : "min-h-screen bg-slate-950"
        }
      >
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
            element={protegerRuta(<Home onLogout={cerrarSesion} />)}
          />

          <Route
            path="/publicar"
            element={protegerRuta(<CreatePost />)}
          />

          <Route
            path="/reportar"
            element={protegerRuta(<CreateReport />)}
          />

          <Route path="/perfil" element={protegerRuta(<Profile />)} />

          <Route
            path="/editar-perfil"
            element={protegerRuta(<EditProfile />)}
          />

          <Route path="/mensajes" element={protegerRuta(<Messages />)} />

          <Route path="/en-vivo" element={protegerRuta(<Live />)} />

          <Route
            path="/publicacion/:id"
            element={protegerRuta(<ContentDetail />)}
          />

          <Route
            path="/reporte/:id"
            element={protegerRuta(<ContentDetail />)}
          />

          <Route path="/personas" element={protegerRuta(<People />)} />

          <Route
            path="/usuario/:id"
            element={protegerRuta(<UserProfile />)}
          />

          <Route
            path="/notificaciones"
            element={protegerRuta(<Notifications />)}
          />

          <Route path="/mapa" element={protegerRuta(<MapPage />)} />

          <Route path="/buscar" element={protegerRuta(<SearchPage />)} />

          <Route
            path="/comunidades"
            element={protegerRuta(<Communities />)}
          />

          <Route
            path="/comunidad/:id"
            element={protegerRuta(<CommunityDetail />)}
          />

          <Route
            path="*"
            element={
              <Navigate to={autenticado ? "/" : "/login"} replace />
            }
          />
        </Routes>
      </div>

      {autenticado && <BottomNav />}
      {autenticado && <DesktopChrome onLogout={cerrarSesion} />}
    </>
  );
}