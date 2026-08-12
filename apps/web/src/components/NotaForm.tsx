import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import CancelIcon from "@mui/icons-material/Cancel";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import AddIcon from "@mui/icons-material/Add";
import dayjs from "dayjs";
import { destinos, tipos } from "../constants";
import type { Nota, NotaPayload } from "../types";

const notaSchema = z.object({
  tipo: z.string().min(1, "Seleccione un tipo"),
  numero: z.string().min(1, "El número es obligatorio"),
  fojas: z.string(),
  fecha: z.string().min(1, "La fecha es obligatoria"),
  horas: z.string().min(1, "La hora es obligatoria"),
  firmante: z.string().min(1, "El firmante es obligatorio"),
  destino: z.string().min(1, "Seleccione un destino"),
  extracto: z.string().min(1, "El extracto es obligatorio"),
});

type FormValues = z.infer<typeof notaSchema>;

interface NotaFormProps {
  nota?: Nota | null;
  proximoNumero: string;
  hoy: string;
  horaActual: string;
  deshabilitado: boolean;
  cargando: boolean;
  onNuevaNota: () => void;
  onGuardar: (payload: NotaPayload) => void;
  onCancelar: () => void;
}

function capitalizar(texto: string) {
  return texto
    .toLowerCase()
    .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase())
    .trim();
}

const campo = { bgcolor: "campo" };

export function NotaForm({
  nota,
  proximoNumero,
  hoy,
  horaActual,
  deshabilitado,
  cargando,
  onNuevaNota,
  onGuardar,
  onCancelar,
}: NotaFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(notaSchema),
    defaultValues: {
      tipo: "Entrada",
      numero: proximoNumero,
      fojas: "1",
      fecha: hoy,
      horas: horaActual,
      firmante: "",
      destino: "Intendencia",
      extracto: "",
    },
  });

  const valores = watch();

  const labelShrink = (campo: keyof FormValues) => ({
    inputLabel: { shrink: Boolean(valores[campo]) },
  });

  useEffect(() => {
    if (nota) {
      reset({
        tipo: nota.tipo,
        numero: nota.numero,
        fojas: nota.fojas.replace(/^0|\.$/g, ""),
        fecha: nota.fecha,
        horas: nota.hora,
        firmante: nota.firmante,
        destino: nota.para,
        extracto: nota.extracto,
      });
    } else {
      reset({
        tipo: "Entrada",
        numero: proximoNumero,
fojas: "1",
      fecha: hoy,
      horas: horaActual,
      firmante: "",
      destino: "Intendencia",
      extracto: "",
    });
    }
  }, [nota, hoy, horaActual]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!nota && valores.numero !== proximoNumero) {
      setValue("numero", proximoNumero);
    }
  }, [proximoNumero]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = (values: FormValues) => {
    onGuardar({
      tipo: values.tipo,
      numero: values.numero.trim().padStart(3, "0"),
      fojas: values.fojas ? `0${values.fojas}.` : "-.",
      fecha: values.fecha,
      hora: values.horas,
      firmante: capitalizar(values.firmante),
      extracto: values.extracto,
      para: values.destino,
    });
  };

  return (
    <Box
      component="form"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
    >
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        <Controller
          name="tipo"
          control={control}
          render={({ field }) => (
            <TextField
              select
              label="Tipo"
              size="small"
              sx={{ ...campo, width: 140 }}
              disabled={deshabilitado}
              error={Boolean(errors.tipo)}
              helperText={errors.tipo?.message}
              slotProps={{ inputLabel: { shrink: true } }}
              {...field}
            >
              {tipos.map((t) => (
                <MenuItem key={t.id} value={t.nombre}>
                  {t.nombre}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        <TextField
          label="Nº"
          size="small"
          sx={{ ...campo, width: 90 }}
          disabled={deshabilitado}
          error={Boolean(errors.numero)}
          helperText={errors.numero?.message}
          slotProps={labelShrink("numero")}
          {...register("numero")}
          onBlur={(e) => {
            setValue("numero", e.target.value.trim().padStart(3, "0"));
          }}
        />

        <TextField
          label="Fojas"
          size="small"
          sx={{ ...campo, width: 90 }}
          disabled={deshabilitado}
          error={Boolean(errors.fojas)}
          helperText={errors.fojas?.message}
          slotProps={labelShrink("fojas")}
          {...register("fojas")}
        />

        <Controller
          name="fecha"
          control={control}
          render={({ field }) => (
            <DatePicker
              label="Fecha"
              format="DD/MM/YYYY"
              value={field.value ? dayjs(field.value, "DD/MM/YYYY") : null}
              onChange={(v) => field.onChange(v ? v.format("DD/MM/YYYY") : "")}
              disabled={deshabilitado}
              slotProps={{
                textField: {
                  size: "small",
                  sx: { ...campo, width: 150 },
                  error: Boolean(errors.fecha),
                  helperText: errors.fecha?.message,
                },
              }}
            />
          )}
        />

        <TextField
          label="Hora"
          size="small"
          sx={{ ...campo, width: 110 }}
          disabled={deshabilitado}
          error={Boolean(errors.horas)}
          helperText={errors.horas?.message}
          slotProps={labelShrink("horas")}
          {...register("horas")}
        />

        <TextField
          label={valores.tipo === "Salida" ? "Firmada por" : "Presentada por"}
          size="small"
          sx={{ ...campo, flexGrow: 1, minWidth: 200 }}
          disabled={deshabilitado}
          error={Boolean(errors.firmante)}
          helperText={errors.firmante?.message}
          slotProps={labelShrink("firmante")}
          {...register("firmante")}
        />

        <Controller
          name="destino"
          control={control}
          render={({ field }) =>
            valores.tipo === "Salida" ? (
              <TextField
                label="Dirigido a"
                size="small"
                sx={{ ...campo, flexGrow: 1, minWidth: 200 }}
                disabled={deshabilitado}
                error={Boolean(errors.destino)}
                helperText={errors.destino?.message}
                slotProps={{ inputLabel: { shrink: Boolean(field.value) } }}
                {...field}
              />
            ) : (
            <TextField
              select
              label="Dirigido a"
              size="small"
              sx={{ ...campo, flexGrow: 1, minWidth: 200 }}
              disabled={deshabilitado}
              error={Boolean(errors.destino)}
              helperText={errors.destino?.message}
              slotProps={{ inputLabel: { shrink: Boolean(field.value) } }}
              {...field}
            >
              <MenuItem value="">Seleccionar...</MenuItem>
              {destinos.map((d) => (
                <MenuItem key={d.id} value={d.nombre}>
                  {d.nombre}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
      </Box>

      <TextField
        label="Extracto"
        multiline
        rows={4}
        fullWidth
        sx={campo}
        disabled={deshabilitado}
        error={Boolean(errors.extracto)}
        helperText={errors.extracto?.message}
        slotProps={labelShrink("extracto")}
        {...register("extracto")}
      />

      <Box sx={{ display: "flex", justifyContent: "center", gap: 2, my: 2 }}>
        {deshabilitado && (
          <Button
            onClick={onNuevaNota}
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            color="primary"
          >
            Nueva Nota
          </Button>
        )}
        <Button
          onClick={() => {
            reset();
            onCancelar();
          }}
          variant="outlined"
          size="large"
          startIcon={<CancelIcon />}
          color="error"
          disabled={deshabilitado}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="outlined"
          size="large"
          color="success"
          disabled={deshabilitado || cargando}
          startIcon={
            cargando ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <SaveOutlinedIcon />
            )
          }
        >
          {cargando ? "Guardando..." : nota ? "Actualizar" : "Guardar"}
        </Button>
      </Box>
    </Box>
  );
}
