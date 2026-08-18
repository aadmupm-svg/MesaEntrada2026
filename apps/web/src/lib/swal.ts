import Swal from "sweetalert2";

const MODO_KEY = "mesa-entrada-modo";

function esOscuro(): boolean {
  return localStorage.getItem(MODO_KEY) === "oscuro";
}

const base = () => {
  const oscuro = esOscuro();

  return {
    background: oscuro ? "#1e1e1e" : "#ffffff",
    color: oscuro ? "#e3e3e3" : "#333333",
    iconColor: oscuro ? "#7fbfb5" : "#377D71",
    confirmButtonColor: oscuro ? "#7fbfb5" : "#377D71",
    padding: "1.8rem",
    showClass: { popup: "swal2-show" },
    hideClass: { popup: "swal2-hide" },
  };
};

export const toastOk = (mensaje: string) => {
  const oscuro = esOscuro();

  return Swal.fire({
    ...base(),
    icon: "success",
    iconColor: oscuro ? "#7fbfb5" : "#377D71",
    title: "Mesa de Entrada",
    text: mensaje,
    background: oscuro ? "#14322c" : "#CDF0EA",
    timer: 4000,
    timerProgressBar: true,
    showConfirmButton: true,
    confirmButtonText: "Aceptar",
  });
};

export const toastError = (mensaje?: string) => {
  const oscuro = esOscuro();

  return Swal.fire({
    ...base(),
    icon: "error",
    iconColor: oscuro ? "#ff8a80" : "#b23b3b",
    title: "Mesa de Entrada",
    text: mensaje ?? "Se ha producido un error, vuelva a intentarlo por favor.",
    background: oscuro ? "#3d2323" : "#FFD1D1",
    timer: 4000,
    timerProgressBar: true,
    showConfirmButton: true,
    confirmButtonText: "Aceptar",
  });
};

export const toastInfo = (mensaje: string) => {
  const oscuro = esOscuro();

  return Swal.fire({
    ...base(),
    icon: "info",
    iconColor: oscuro ? "#8db4e8" : "#0d3b66",
    title: "Mesa de Entrada",
    text: mensaje,
    background: oscuro ? "#1c2938" : "#D6E4F0",
    timer: 4000,
    timerProgressBar: true,
    showConfirmButton: true,
    confirmButtonText: "Aceptar",
  });
};

export const confirmarEliminar = (texto: string) => {
  const oscuro = esOscuro();

  return Swal.fire({
    ...base(),
    icon: "warning",
    title: "¿Está seguro que desea eliminar?",
    text: texto,
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: oscuro ? "#ff8a80" : "#b23b3b",
    cancelButtonColor: oscuro ? "#455a64" : "#9e9e9e",
    buttonsStyling: true,
  });
};
