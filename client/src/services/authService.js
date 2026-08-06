const API_URL = "http://localhost:5000/api";

const procesarRespuesta = async (respuesta) => {
  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      datos.mensaje || "Ocurrió un problema con el servidor.",
    );
  }

  return datos;
};

export const iniciarSesion = async ({
  identificador,
  contrasena,
}) => {
  const respuesta = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      identificador,
      contrasena,
    }),
  });

  return procesarRespuesta(respuesta);
};

export const registrarUsuario = async ({
  nombre,
  usuario,
  correo,
  contrasena,
}) => {
  const respuesta = await fetch(`${API_URL}/auth/registro`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      nombre,
      usuario,
      correo,
      contrasena,
    }),
  });

  return procesarRespuesta(respuesta);
};

export const obtenerMiPerfil = async (token) => {
  const respuesta = await fetch(`${API_URL}/auth/perfil`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return procesarRespuesta(respuesta);
};