import { useState } from "react";
import { Navigate, Route, Routes } from "react-router";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import CreateReport from "./pages/CreateReport";

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
        path="/"
        element={
          autenticado ? (
            <Home onLogout={cerrarSesion} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/"
        element={
          autenticado ? <Home /> : <Navigate to="/login" replace />
        }
      />

      <Route
        path="/reportar"
        element={
          autenticado ? (
            <CreateReport />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="*"
        element={
          <Navigate to={autenticado ? "/" : "/login"} replace />
        }
      />
    </Routes>
  );
}