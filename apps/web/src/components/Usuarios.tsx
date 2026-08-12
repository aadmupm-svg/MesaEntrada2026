import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { confirmarEliminar, toastError, toastOk } from "../lib/swal";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PersonIcon from "@mui/icons-material/Person";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { crearUsuario, actualizarUsuario, eliminarUsuario, getUsuarios } from "../api/usuarios";
import useAuth from "../auth/useAuth";
import type { Usuario } from "../types";

const formSchema = z.object({
  usuario: z
    .string()
    .trim()
    .min(3, "Debe tener al menos 3 caracteres")
    .max(50, "Máximo 50 caracteres"),
  pass: z
    .string()
    .min(4, "Debe tener al menos 4 caracteres")
    .max(100, "Máximo 100 caracteres"),
  admin: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export function Usuarios() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dialogo, setDialogo] = useState<{ abierto: boolean; editando: Usuario | null }>({
    abierto: false,
    editando: null,
  });
  const [verPass, setVerPass] = useState(false);

  const { data: usuarios, isLoading } = useQuery({
    queryKey: ["usuarios"],
    queryFn: getUsuarios,
  });

  const invalidar = () =>
    queryClient.invalidateQueries({ queryKey: ["usuarios"], refetchType: "all" });

  const { mutate: guardar, isPending: guardando } = useMutation({
    mutationFn: ({ id, values }: { id?: number; values: FormValues }) =>
      id
        ? actualizarUsuario(id, {
            usuario: values.usuario,
            admin: values.admin,
            ...(values.pass ? { pass: values.pass } : {}),
          })
        : crearUsuario(values),
    onSuccess: () => {
      invalidar();
      cerrarDialogo();
      toastOk(dialogo.editando ? "Usuario actualizado" : "Usuario creado con éxito");
    },
    onError: (err) => {
      const msg = err as { response?: { data?: { message?: string } } };
      toastError(msg.response?.data?.message);
    },
  });

  const { mutate: borrar } = useMutation({
    mutationFn: (id: number) => eliminarUsuario(id),
    onSuccess: () => {
      invalidar();
      toastOk("Se ha eliminado el usuario con éxito");
    },
    onError: (err) => {
      const msg = err as { response?: { data?: { message?: string } } };
      toastError(msg.response?.data?.message);
    },
  });

  const abrirDialogo = (editando: Usuario | null) => {
    reset(editando ? { usuario: editando.usuario, pass: "", admin: editando.admin } : { usuario: "", pass: "", admin: false });
    setDialogo({ abierto: true, editando });
  };

  const cerrarDialogo = () => {
    setDialogo({ abierto: false, editando: null });
  };

  const handleEliminar = (u: Usuario) => {
    confirmarEliminar(`Se eliminará el usuario "${u.usuario}"`).then((result) => {
      if (result.isConfirmed) {
        borrar(u.id);
      }
    });
  };

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(formSchema) });

  const onSubmit = (values: FormValues) => {
    guardar({ id: dialogo.editando?.id, values });
  };

  return (
    <Box sx={{ minHeight: "100vh", pb: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2, flexWrap: "wrap", gap: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton color="primary" onClick={() => navigate("/home")} aria-label="volver">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6">Administración de Usuarios</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => abrirDialogo(null)}>
          Nuevo Usuario
        </Button>
      </Box>

      <Box sx={{ px: 2 }}>
        <TableContainer component={Paper} elevation={2}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "titulo" }}>
                <TableCell sx={{ color: "white", width: 60 }}>#</TableCell>
                <TableCell sx={{ color: "white" }}>
                  <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                    <PersonIcon fontSize="small" /> Usuario
                  </Stack>
                </TableCell>
                <TableCell sx={{ color: "white", width: 140 }} align="center">
                  Rol
                </TableCell>
                <TableCell sx={{ color: "white", width: 220 }} align="center">
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <CircularProgress size={28} sx={{ my: 2 }} />
                  </TableCell>
                </TableRow>
              ) : (
                (usuarios ?? []).map((u) => (
                  <TableRow key={u.id} hover>
                    <TableCell>{u.id}</TableCell>
                    <TableCell>
                      {u.usuario}
                      {u.usuario === user && (
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          (vos)
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {u.admin ? (
                        <Typography variant="body2" sx={{ color: "secondary.main", fontWeight: 600 }}>
                          Administrador
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Usuario
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Editar">
                        <IconButton size="small" color="primary" onClick={() => abrirDialogo(u)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={u.usuario === user ? "No puede eliminarse a sí mismo" : "Eliminar"}>
                        <span>
                          <IconButton
                            size="small"
                            color="error"
                            disabled={u.usuario === user}
                            onClick={() => handleEliminar(u)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Dialog open={dialogo.abierto} onClose={cerrarDialogo} fullWidth maxWidth="xs">
        <DialogTitle>
          {dialogo.editando ? `Editar usuario "${dialogo.editando.usuario}"` : "Nuevo usuario"}
        </DialogTitle>
        <DialogContent>
          <Box component="form" id="form-usuario" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Nombre de Usuario"
              error={Boolean(errors.usuario)}
              helperText={errors.usuario?.message}
              {...register("usuario")}
            />
            <TextField
              margin="normal"
              fullWidth
              label={dialogo.editando ? "Nueva contraseña (vacío = no cambiar)" : "Contraseña"}
              type={verPass ? "text" : "password"}
              required={!dialogo.editando}
              error={Boolean(errors.pass)}
              helperText={errors.pass?.message}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={verPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                        onClick={() => setVerPass((v) => !v)}
                        edge="end"
                      >
                        {verPass ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              {...register("pass")}
            />
            <Controller
              name="admin"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch checked={field.value} onChange={(_, checked) => field.onChange(checked)} />}
                  label="Administrador"
                  sx={{ mt: 1 }}
                />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarDialogo} color="inherit">
            Cancelar
          </Button>
          <Button
            type="submit"
            form="form-usuario"
            variant="contained"
            disabled={guardando}
            startIcon={guardando ? <CircularProgress size={18} color="inherit" /> : null}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
