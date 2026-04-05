import { useEffect, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { clientsService } from "../../features/clients/clients.service";
import { ordersService } from "../../features/orders/orders.service";
import type { Client } from "../../types/clients";

function getErrorMessage(error: unknown) {
  const axiosError = error as AxiosError<{ message?: string | string[] }>;
  const apiMessage = axiosError.response?.data?.message;

  if (Array.isArray(apiMessage)) {
    return apiMessage.join(" ");
  }

  if (typeof apiMessage === "string") {
    return apiMessage;
  }

  return "Não foi possível criar o pedido.";
}

export function CreateOrderPage() {
  const navigate = useNavigate();

  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [productionDueDate, setProductionDueDate] = useState("");
  const [shippingDueDate, setShippingDueDate] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadClients = async () => {
      setIsLoadingClients(true);

      try {
        const data = await clientsService.getAll();
        setClients(data.filter((client) => client.isActive));
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      } finally {
        setIsLoadingClients(false);
      }
    };

    void loadClients();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedClient) {
      setErrorMessage("Selecione um cliente para criar o pedido.");
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const order = await ordersService.create({
        clientId: selectedClient.id,
        productionDueDate: productionDueDate || undefined,
        shippingDueDate: shippingDueDate || undefined,
        internalNotes: internalNotes.trim() || undefined,
      });

      navigate(`/orders/${order.id}`, { replace: true });
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" fontWeight={700}>
          Novo pedido
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          Criação do cabeçalho do pedido. Os itens entram no próximo patch.
        </Typography>
      </Box>

      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack component="form" spacing={3} onSubmit={handleSubmit}>
          <Autocomplete
            options={clients}
            value={selectedClient}
            onChange={(_, value) => setSelectedClient(value)}
            loading={isLoadingClients}
            getOptionLabel={(option) =>
              `${option.legalName} - ${option.document}`
            }
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Cliente"
                required
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {isLoadingClients ? <CircularProgress size={18} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              label="Produção prevista"
              type="date"
              value={productionDueDate}
              onChange={(e) => setProductionDueDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Expedição prevista"
              type="date"
              value={shippingDueDate}
              onChange={(e) => setShippingDueDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Stack>

          <TextField
            label="Observações internas"
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            multiline
            minRows={4}
            fullWidth
          />

          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <Button variant="outlined" onClick={() => navigate("/orders")}>
              Cancelar
            </Button>

            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? "Criando..." : "Criar pedido"}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}
