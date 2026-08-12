const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const procesarRespuesta = async (respuesta) => {
  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      datos.mensaje ||
        "No se pudo completar la solicitud.",
    );
  }

  return datos;
};

const solicitar = async (
  ruta,
  token,
  opciones = {},
) => {
  let respuesta;

  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      ...opciones,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...opciones.headers,
      },
    });
  } catch {
    throw new Error(
      "No se pudo conectar con ReportaRD Backend.",
    );
  }

  return procesarRespuesta(respuesta);
};

const crearConsulta = (busqueda) => {
  const parametros = new URLSearchParams();

  if (busqueda.trim()) {
    parametros.set("buscar", busqueda.trim());
  }

  const consulta = parametros.toString();

  return consulta ? `?${consulta}` : "";
};

export const listarPublicaciones = (
  token,
  busqueda = "",
) => {
  return solicitar(
    `/posts${crearConsulta(busqueda)}`,
    token,
  );
};

export const listarReportes = (
  token,
  busqueda = "",
) => {
  return solicitar(
    `/reports${crearConsulta(busqueda)}`,
    token,
  );
};

export const crearPublicacion = (
  token,
  datos,
) => {
  return solicitar("/posts", token, {
    method: "POST",
    body: JSON.stringify(datos),
  });
};

export const crearReporte = (token, datos) => {
  return solicitar("/reports", token, {
    method: "POST",
    body: JSON.stringify(datos),
  });
};