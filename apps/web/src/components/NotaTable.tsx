import {
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditIcon from "@mui/icons-material/Edit";
import type { Nota } from "../types";

const encabezados = [
  "Tipo",
  "Nº Nota",
  "Año",
  "Fojas",
  "Fecha",
  "Hora",
  "Firmante",
  "Extracto",
  "Destino",
  "Acciones",
];

const numStyle = { fontVariantNumeric: "tabular-nums", fontWeight: 500 };

interface NotaTableProps {
  notas: Nota[];
  onEditar: (nota: Nota) => void;
  onEliminar: (nota: Nota) => void;
}

export function NotaTable({ notas, onEditar, onEliminar }: NotaTableProps) {
  return (
    <TableContainer
      component={Paper}
      sx={{ borderRadius: 2, overflow: "hidden", boxShadow: 3 }}
    >
      <Table id="tabla" stickyHeader size="small">
        <TableHead>
          <TableRow>
            {encabezados.map((enc) => (
              <TableCell
                key={enc}
                align="center"
                sx={{
                  bgcolor: "titulo",
                  color: "white",
                  fontWeight: 700,
                  letterSpacing: "0.03em",
                  fontSize: "0.8rem",
                }}
              >
                {enc}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {notas.map((nota) => (
            <TableRow
              key={nota.id}
              hover
              sx={{
                transition: "background-color 0.15s ease",
                "&:nth-of-type(even)": { bgcolor: "action.hover" },
                "&:nth-of-type(even):hover": {
                  bgcolor: "action.selected",
                },
              }}
            >
              <TableCell align="center">
                <Chip
                  label={nota.tipo}
                  size="small"
                  color={nota.tipo === "Entrada" ? "success" : "warning"}
                  sx={{ fontWeight: 500, minWidth: 74 }}
                />
              </TableCell>
              <TableCell align="center" sx={numStyle}>
                {nota.numero}
              </TableCell>
              <TableCell align="center" sx={numStyle}>
                {nota.anio}
              </TableCell>
              <TableCell align="center" sx={numStyle}>
                {nota.fojas}
              </TableCell>
              <TableCell align="center" sx={numStyle}>
                {nota.fecha}
              </TableCell>
              <TableCell align="center" sx={numStyle}>
                {nota.hora}
              </TableCell>
              <TableCell align="center">{nota.firmante}</TableCell>
              <TableCell sx={{ maxWidth: 320, wordBreak: "break-word" }}>
                {nota.extracto}
              </TableCell>
              <TableCell align="center">{nota.para}</TableCell>
              <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                <Tooltip title="Editar">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => onEditar(nota)}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Eliminar">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => onEliminar(nota)}
                  >
                    <DeleteForeverIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
          {notas.length === 0 && (
            <TableRow>
              <TableCell colSpan={encabezados.length} align="center" sx={{ py: 4 }}>
                No hay notas para mostrar
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
