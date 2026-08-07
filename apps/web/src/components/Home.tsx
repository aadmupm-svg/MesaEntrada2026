import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Fab from "@mui/material/Fab";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import TablePagination from "@mui/material/TablePagination";
import TextField from "@mui/material/TextField";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import LogoutIcon from "@mui/icons-material/Logout";
import PrintIcon from "@mui/icons-material/Print";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { getNotas, getProximoNumero, createNota, updateNota, deleteNota, getFechaAutoritativa } from "../api/notas";
import type { Nota, NotaPayload } from "../types";
import useAuth from "../auth/useAuth";
import { notificarCambio, socket } from "../socket";
import { destinos, tipos } from "../constants";
import { NotaForm } from "./NotaForm";
import { NotaTable } from "./NotaTable";
import { useThemeMode } from "../themeMode";
import dayjs from "dayjs";

interface Filtros {
  numero: string;
  tipo: string;
  letra: string;
  fecha: string;
  destino: string;
  anio: string;
  firmante: string;
  extracto: string;
}

const filtrosVacios: Filtros = {
  numero: "",
  tipo: "",
  letra: "",
  fecha: "",
  destino: "",
  anio: "",
  firmante: "",
  extracto: "",
};

const toastOk = (mensaje: string) =>
  Swal.fire({
    icon: "success",
    iconColor: "#377D71",
    title: "Mesa de Entrada",
    text: mensaje,
    background: "#CDF0EA",
    timer: 4000,
    timerProgressBar: true,
    showConfirmButton: false,
  });

const toastError = (mensaje?: string) =>
  Swal.fire({
    icon: "error",
    title: "Mesa de Entrada",
    text: mensaje ?? "Se ha producido un error, vuelva a intentarlo por favor.",
    background: "#FFD1D1",
    timer: 4000,
    timerProgressBar: true,
    showConfirmButton: false,
  });

export function Home() {
  const { user, logout } = useAuth();
  const { modo, alternarModo } = useThemeMode();
  const queryClient = useQueryClient();

  const [notaEdicion, setNotaEdicion] = useState<Nota | null>(null);
  const [formActivo, setFormActivo] = useState(false);
  const [filtros, setFiltros] = useState<Filtros>(filtrosVacios);
  const [filtrosDeb, setFiltrosDeb] = useState<Filtros>(filtrosVacios);
  const [fechaPdf, setFechaPdf] = useState("");
  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(10);

  const { data: notas = [] } = useQuery({ queryKey: ["notas"], queryFn: getNotas });

  const { data: fechaAutoritativa, refetch: refetchFecha } = useQuery({
    queryKey: ["fecha"],
    queryFn: getFechaAutoritativa,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (fechaAutoritativa && !fechaPdf) {
      setFechaPdf(fechaAutoritativa.fecha);
    }
  }, [fechaAutoritativa]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data: proximoNumero = "1" } = useQuery({
    queryKey: ["proximo-numero"],
    queryFn: getProximoNumero,
    enabled: !notaEdicion,
  });

  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    window.onpopstate = () => window.history.go(1);
  }, []);

  useEffect(() => {
    const refetch = () => {
      queryClient.invalidateQueries({ queryKey: ["notas"], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["proximo-numero"], refetchType: "all" });
    };
    socket.on("notas:changed", refetch);
    return () => {
      socket.off("notas:changed", refetch);
    };
  }, [queryClient]);

  useEffect(() => {
    const t = setTimeout(() => setFiltrosDeb(filtros), 300);
    return () => clearTimeout(t);
  }, [filtros]);

  const aniosDisponibles = useMemo(
    () => [...new Set(notas.map((n) => String(n.anio)))].sort((a, b) => Number(b) - Number(a)),
    [notas]
  );

  const notasFiltradas = useMemo(() => {
    const f = filtrosDeb;
    const norm = (s: string) => s.trim().toLowerCase();

    return notas.filter((n) => {
      if (f.tipo && n.tipo !== f.tipo) return false;
      if (f.destino && n.para !== f.destino) return false;
      if (f.anio && String(n.anio) !== f.anio) return false;
      if (norm(f.numero) && !norm(n.numero).includes(norm(f.numero))) return false;
      if (norm(f.letra) && !norm(n.letra).includes(norm(f.letra))) return false;
      if (norm(f.fecha) && !norm(n.fecha).includes(norm(f.fecha))) return false;
      if (norm(f.firmante) && !norm(n.firmante).includes(norm(f.firmante))) return false;
      if (norm(f.extracto) && !norm(n.extracto).includes(norm(f.extracto))) return false;
      return true;
    });
  }, [notas, filtrosDeb]);

  useEffect(() => {
    setPagina(0);
  }, [filtrosDeb]);

  useEffect(() => {
    const maxPagina = Math.max(0, Math.ceil(notasFiltradas.length / filasPorPagina) - 1);
    if (pagina > maxPagina) setPagina(maxPagina);
  }, [notasFiltradas.length, filasPorPagina, pagina]);

  const notasPagina = useMemo(
    () => notasFiltradas.slice(pagina * filasPorPagina, pagina * filasPorPagina + filasPorPagina),
    [notasFiltradas, pagina, filasPorPagina]
  );

  const setFiltro = (campo: keyof Filtros) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFiltros((prev) => ({ ...prev, [campo]: e.target.value }));

  const limpiarFiltros = () => setFiltros(filtrosVacios);

  const invalidarNotas = () => {
    queryClient.invalidateQueries({ queryKey: ["notas"], refetchType: "all" });
    queryClient.invalidateQueries({ queryKey: ["proximo-numero"], refetchType: "all" });
  };

  const actualizarCache = (notaGuardada: Nota) => {
    queryClient.setQueryData<Nota[]>(["notas"], (viejas = []) => {
      if (notaEdicion) {
        return viejas.map((n) => (n.id === notaGuardada.id ? notaGuardada : n));
      }
      return viejas.some((n) => n.id === notaGuardada.id)
        ? viejas
        : [notaGuardada, ...viejas];
    });
  };

  const quitarDeCache = (id: number) => {
    queryClient.setQueryData<Nota[]>(["notas"], (viejas = []) =>
      viejas.filter((n) => n.id !== id)
    );
  };

  const guardarMutation = useMutation({
    mutationFn: (payload: NotaPayload) =>
      notaEdicion ? updateNota(notaEdicion.id, payload) : createNota(payload),
    onSuccess: (notaGuardada) => {
      actualizarCache(notaGuardada);
      invalidarNotas();
      setNotaEdicion(null);
      setFormActivo(false);
      notificarCambio();
      toastOk(notaEdicion ? "Se ha actualizado con éxito !" : "Se ha guardado con éxito !");
    },
    onError: (err) => {
      const msg = err as { response?: { data?: { message?: string } } };
      toastError(msg.response?.data?.message);
    },
  });

  const eliminarMutation = useMutation({
    mutationFn: deleteNota,
    onSuccess: (_data, id) => {
      quitarDeCache(id);
      invalidarNotas();
      notificarCambio();
      toastOk("Se ha eliminado con éxito !");
    },
    onError: () => toastError(),
  });

  const handleEliminar = (nota: Nota) => {
    Swal.fire({
      title: "¿Está seguro que desea eliminar?",
      showDenyButton: true,
      confirmButtonText: "Eliminar",
      denyButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        eliminarMutation.mutate(nota.id);
      } else if (result.isDenied) {
        toastOk("No se ha eliminado nada !");
      }
    });
  };

  const cerrarSesion = () => {
    logout();
  };

  const handleNuevaNota = async () => {
    setNotaEdicion(null);
    setFormActivo(true);
    await refetchFecha();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEditar = (nota: Nota) => {
    setNotaEdicion(nota);
    setFormActivo(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelar = () => {
    setNotaEdicion(null);
    setFormActivo(false);
  };

  const handleImprimir = async () => {
    const { imprimirPlanilla } = await import("./pdf/PrintTable");
    imprimirPlanilla(notas, fechaPdf, fechaAutoritativa?.fecha ?? dayjs().format("DD/MM/YYYY"));
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
    <Box sx={{ minHeight: "100vh", pb: 4 }}>
      <Tooltip title="Ir arriba">
        <Fab
          aria-label="inicio"
          sx={{ position: "fixed", bottom: 16, right: 12, bgcolor: "primary.main" }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <KeyboardArrowUpIcon />
        </Fab>
      </Tooltip>

      <Container maxWidth="md">
        <Box sx={{ display: "flex", justifyContent: "flex-end", py: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {user}
            </Typography>
            <Tooltip title={modo === "oscuro" ? "Modo claro" : "Modo oscuro"}>
              <IconButton color="primary" onClick={alternarModo}>
                {modo === "oscuro" ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Salir del Sistema">
              <IconButton color="error" onClick={cerrarSesion}>
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Box sx={{ bgcolor: "titulo", borderRadius: 2 }}>
          <Typography
            variant="h2"
            sx={{ color: "white", textAlign: "center", my: 3, borderRadius: 2 }}
          >
            Mesa de Entrada y Salidas
          </Typography>
        </Box>
      </Container>

      <Container maxWidth="xl">
        <NotaForm
          nota={notaEdicion}
          proximoNumero={proximoNumero}
          hoy={fechaAutoritativa?.fecha ?? ""}
          horaActual={fechaAutoritativa?.hora ?? ""}
          deshabilitado={!formActivo}
          cargando={guardarMutation.isPending}
          onNuevaNota={handleNuevaNota}
          onGuardar={(payload) => guardarMutation.mutate(payload)}
          onCancelar={handleCancelar}
        />
      </Container>

      <Divider />

      <Container maxWidth="sm">
        <Box sx={{ bgcolor: "titulo", borderRadius: 2 }}>
          <Typography
            variant="h2"
            sx={{ color: "white", textAlign: "center", my: 3, borderRadius: 2 }}
          >
            Buscar
          </Typography>
        </Box>
      </Container>

      <Container maxWidth="lg">
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "center" }}>
          <TextField
            label="Nº"
            size="small"
            value={filtros.numero}
            onChange={setFiltro("numero")}
            sx={{ bgcolor: "campo", width: 90 }}
          />
          <TextField
            select
            label="Tipo"
            size="small"
            value={filtros.tipo}
            onChange={setFiltro("tipo")}
            sx={{ bgcolor: "campo", width: 130 }}
          >
            <MenuItem value="">Todos</MenuItem>
            {tipos.map((t) => (
              <MenuItem key={t.id} value={t.nombre}>
                {t.nombre}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Letra"
            size="small"
            value={filtros.letra}
            onChange={setFiltro("letra")}
            sx={{ bgcolor: "campo", width: 90 }}
          />
          <DatePicker
            label="Fecha"
            slotProps={{
              textField: {
                size: "small",
                sx: { bgcolor: "campo", width: 150 },
              },
            }}
            value={filtros.fecha ? dayjs(filtros.fecha, "DD/MM/YYYY") : null}
            onChange={(v) =>
              setFiltros((prev) => ({
                ...prev,
                fecha: v ? v.format("DD/MM/YYYY") : "",
              }))
            }
            format="DD/MM/YYYY"
          />
          <TextField
            select
            label="Destino"
            size="small"
            value={filtros.destino}
            onChange={setFiltro("destino")}
            sx={{ bgcolor: "campo", minWidth: 150 }}
          >
            <MenuItem value="">Todos</MenuItem>
            {destinos.map((d) => (
              <MenuItem key={d.id} value={d.nombre}>
                {d.nombre}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Año"
            size="small"
            value={filtros.anio}
            onChange={setFiltro("anio")}
            sx={{ bgcolor: "campo", width: 100 }}
          >
            <MenuItem value="">Todos</MenuItem>
            {aniosDisponibles.map((a) => (
              <MenuItem key={a} value={a}>
                {a}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Presentado por"
            size="small"
            value={filtros.firmante}
            onChange={setFiltro("firmante")}
            sx={{ bgcolor: "campo" }}
          />
          <TextField
            label="Extracto"
            size="small"
            value={filtros.extracto}
            onChange={setFiltro("extracto")}
            sx={{ bgcolor: "campo", width: "25%" }}
          />
        </Box>
        <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
          <Button
            onClick={limpiarFiltros}
            variant="outlined"
            size="large"
            startIcon={<FilterListOffIcon />}
            color="error"
          >
            Limpiar Filtros
          </Button>
        </Box>
      </Container>

      <Divider sx={{ mb: 3 }} />

      <Container maxWidth="sm">
        <Box sx={{ bgcolor: "titulo", borderRadius: 2 }}>
          <Typography
            variant="h2"
            sx={{ color: "white", textAlign: "center", my: 3, borderRadius: 2 }}
          >
            Imprimir Resumen
          </Typography>
        </Box>
      </Container>

      <Container maxWidth="lg">
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <DatePicker
            label="Fecha"
            slotProps={{
              textField: {
                size: "small",
                sx: { bgcolor: "campo", width: 150 },
              },
            }}
            value={fechaPdf ? dayjs(fechaPdf, "DD/MM/YYYY") : null}
            onChange={(v) => setFechaPdf(v ? v.format("DD/MM/YYYY") : "")}
            format="DD/MM/YYYY"
          />
          <Tooltip title="Imprimir">
            <IconButton
              color="primary"
              aria-label="print"
              sx={{ ml: 3 }}
              onClick={handleImprimir}
            >
              <PrintIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Container>

      <Divider sx={{ my: 3 }} />

      <Container maxWidth="lg">
        <Box sx={{ display: "flex", justifyContent: "center", mb: 0.5 }}>
          <TablePagination
            component="div"
            count={notasFiltradas.length}
            page={pagina}
            rowsPerPage={filasPorPagina}
            rowsPerPageOptions={[10, 25, 50, 100]}
            onPageChange={(_e, p) => setPagina(p)}
            onRowsPerPageChange={(e) => {
              setFilasPorPagina(parseInt(e.target.value, 10));
              setPagina(0);
            }}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
            sx={{ border: "none", boxShadow: "none" }}
          />
        </Box>
        <NotaTable
          notas={notasPagina}
          onEditar={handleEditar}
          onEliminar={handleEliminar}
        />
      </Container>
    </Box>
    </LocalizationProvider>
  );
}
