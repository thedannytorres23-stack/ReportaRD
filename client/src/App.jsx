import { useEffect, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
} from "react-router";
import BottomNav from "./components/BottomNav";
import DesktopChrome from "./components/DesktopChrome";
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
import Live from "./pages/Live";
import { obtenerMiPerfil } from "./services/authService";

const obtenerEstadoInicial = () => {
  const token = localStorage.getItem("reportard_token");

  return {
    autenticado: false,
    verificando: Boolean(token),
  };
};

export default function App() {
  const [sesion, setSesion] = useState(
    obtenerEstadoInicial,
  );

  const { autenticado, verificando } = sesion;

  useEffect(() => {
    const token = localStorage.getItem(
      "reportard_token",
    );

    if (!token) return undefined;

    let componenteActivo = true;

    obtenerMiPerfil(token)
      .then((respuesta) => {
        if (!componenteActivo) return;

        localStorage.setItem(
          "reportard_user",
          JSON.stringify(respuesta.usuario),
        );

        localStorage.removeItem("reportard_session");

        setSesion({
          autenticado: true,
          verificando: false,
        });
      })
      .catch(() => {
        if (!componenteActivo) return;

        localStorage.removeItem("reportard_token");
        localStorage.removeItem("reportard_user");
        localStorage.removeItem("reportard_profile");
        localStorage.removeItem("reportard_session");

        setSesion({
          autenticado: false,
          verificando: false,
        });
      });

    return () => {
      componenteActivo = false;
    };
  }, []);

  const autenticarUsuario = () => {
    setSesion({
      autenticado: true,
      verificando: false,
    });
  };

  const cerrarSesion = () => {
    localStorage.removeItem("reportard_token");
    localStorage.removeItem("reportard_user");
    localStorage.removeItem("reportard_profile");
    localStorage.removeItem("reportard_session");

    setSesion({
      autenticado: false,
      verificando: false,
    });
  };

  const protegerRuta = (componente) => {
    return autenticado ? (
      componente
    ) : (
      <Navigate to="/login" replace />
    );
  };

  if (verificando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-white/10 border-t-red-500" />

          <p className="mt-4 text-sm text-slate-400">
            Verificando tu sesión...
          </p>
        </div>
      </div>
    );
  }

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
                <Login
                  onLogin={autenticarUsuario}
                />
              )
            }
          />

          <Route
            path="/registro"
            element={
              autenticado ? (
                <Navigate to="/" replace />
              ) : (
                <Register
                  onRegister={autenticarUsuario}
                />
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
            path="/mensajes"
            element={protegerRuta(<Messages />)}
          />

          <Route
            path="/en-vivo"
            element={protegerRuta(<Live />)}
          />

          <Route
            path="/publicacion/:id"
            element={protegerRuta(<ContentDetail />)}
          />

          <Route
            path="/reporte/:id"
            element={protegerRuta(<ContentDetail />)}
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
            path="/buscar"
            element={protegerRuta(<SearchPage />)}
          />

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
              <Navigate
                to={autenticado ? "/" : "/login"}
                replace
              />
            }
          />
        </Routes>
      </div>

      {autenticado && <BottomNav />}

      {autenticado && (
        <DesktopChrome onLogout={cerrarSesion} />
      )}
    </>
  );
}