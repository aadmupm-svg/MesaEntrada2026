import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LoginIcon from "@mui/icons-material/Login";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { login } from "../api/auth";
import useAuth from "../auth/useAuth";
import { useThemeMode } from "../themeMode";

const loginSchema = z.object({
  usuario: z.string().trim().min(1, "Ingrese un usuario"),
  pass: z.string().min(1, "Ingrese una contraseña"),
});

type LoginForm = z.infer<typeof loginSchema>;

export function Login() {
  const { login: guardarSesion } = useAuth();
  const { modo, alternarModo } = useThemeMode();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [verPass, setVerPass] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const { mutate, isPending } = useMutation({
    mutationFn: ({ usuario, pass }: LoginForm) => login(usuario, pass),
    onSuccess: ({ token, usuario }) => {
      guardarSesion(token, usuario);
      navigate("/home");
    },
    onError: (err) => {
      const msg = err as { response?: { data?: { message?: string } } };
      setError(msg.response?.data?.message ?? "No se pudo iniciar sesión");
    },
  });

  const onSubmit = (values: LoginForm) => {
    setError("");
    mutate(values);
  };

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <IconButton
        aria-label="modo oscuro"
        color="primary"
        onClick={alternarModo}
        sx={{ position: "fixed", top: 12, right: 12, zIndex: 2 }}
      >
        {modo === "oscuro" ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>

      <Paper
        elevation={3}
        sx={{ width: "100%", maxWidth: 420, borderRadius: 3, p: { xs: 3, sm: 4 } }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
            mb: 3,
          }}
        >
          <Avatar sx={{ bgcolor: "secondary.main", width: 56, height: 56 }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5" sx={{ fontWeight: 600, mt: 1 }}>
            Mesa de Entrada
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ingrese con su usuario para continuar
          </Typography>
        </Box>

        <Box
          component="form"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          <TextField
            margin="normal"
            required
            fullWidth
            id="usuario"
            label="Nombre de Usuario"
            autoComplete="username"
            autoFocus
            error={Boolean(errors.usuario)}
            helperText={errors.usuario?.message}
            {...register("usuario")}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Contraseña"
            type={verPass ? "text" : "password"}
            id="password"
            autoComplete="current-password"
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
          {error && (
            <Typography
              color="error"
              variant="body2"
              role="alert"
              sx={{ mt: 1, textAlign: "center" }}
            >
              {error}
            </Typography>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={isPending}
            startIcon={
              isPending ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />
            }
            sx={{
              mt: 3,
              mb: 1,
              py: 1.2,
              boxShadow: "0 4px 12px rgba(13, 59, 102, 0.3)",
              transition: "box-shadow 0.2s ease, transform 0.2s ease",
              "&:hover:not(:disabled)": {
                boxShadow: "0 8px 20px rgba(13, 59, 102, 0.45)",
                transform: "translateY(-1px)",
              },
              "&:disabled": { boxShadow: "none" },
            }}
          >
            {isPending ? "Ingresando..." : "Ingresar"}
          </Button>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Tooltip title="Desarrollado por Hugo Goncalvez" placement="top">
          <Typography
            align="center"
            variant="caption"
            color="text.secondary"
            component="p"
            sx={{ cursor: "pointer" }}
          >
            © {new Date().getFullYear()} Mesa de Entrada · Sistema de registro de notas
          </Typography>
        </Tooltip>
      </Paper>
    </Box>
  );
}
