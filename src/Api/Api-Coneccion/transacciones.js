import { API_URL } from "./Api";

export async function getTransacciones() {
  const res = await fetch(`${API_URL}/transacciones/usuario`);
  if (!res.ok) throw new Error("Error al obtener transacciones");
  return res.json();
}