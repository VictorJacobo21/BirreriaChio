import axios from "axios";

const API_URL = "http://192.168.100.166:3000";

export const getPedidosActivos = async () => {
  const res = await axios.get(`${API_URL}/pedidos/activos`);
  return res.data;
};

export const getPedidosListos = async () => {
  const res = await axios.get(`${API_URL}/pedidos/listos`);
  return res.data;
};

export const cambiarEstadoPedido = async (id, estado) => {
  const res = await axios.patch(`${API_URL}/pedidos/${id}/estado`, {
    estado
  });
  return res.data;
};

export const pagarPedido = async (id) => {
  const res = await axios.patch(`${API_URL}/pedidos/${id}/pagar`);
  return res.data;
};

export const getPedidosPagados = async () => {
  const res = await axios.get(`${API_URL}/pedidos/pagados`);
  return res.data;
};
