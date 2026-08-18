const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

const procesarRespuesta = async (respuesta) => {
  let datos;

  try {
    datos = await respuesta.json();
  } catch {
    throw new Error("El servidor devolvió una respuesta inválida.");
  }

  if (!respuesta.ok) {
    throw new Error(
      datos.mensaje || "Ocurrió un problema con el servidor.",
    );
  }

  return datos;
};

const realizarPeticion = async (ruta, opciones = {}) => {
  try {
    const respuesta = await fetch(`${API_URL}${ruta}`, opciones);
    return procesarRespuesta(respuesta);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        "No se pudo conectar con el backend. Comprueba que esté encendido.",
        { cause: error },
      );
    }

    throw error;
  }
};

export const iniciarSesion = ({ identificador, contrasena }) => {
  return realizarPeticion("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identificador, contrasena }),
  });
};

export const registrarUsuario = ({
  nombre,
  usuario,
  correo,
  contrasena,
}) => {
  return realizarPeticion("/auth/registro", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, usuario, correo, contrasena }),
  });
};

export const obtenerMiPerfil = (token) => {
  return realizarPeticion("/auth/perfil", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const actualizarMiPerfil = (datosPerfil, token) => {
  return realizarPeticion("/auth/perfil", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(datosPerfil),
  });
};