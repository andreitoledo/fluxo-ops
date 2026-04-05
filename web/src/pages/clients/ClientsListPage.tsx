import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import {
  createClient,
  getClients,
} from "../../features/clients/clients.service";
import type { Client } from "../../types/clients";

function extractApiErrorMessage(error: unknown) {
  const axiosError = error as AxiosError<{ message?: string | string[] }>;
  const apiMessage = axiosError.response?.data?.message;

  if (Array.isArray(apiMessage)) {
    return apiMessage.join(" ");
  }

  if (typeof apiMessage === "string") {
    return apiMessage;
  }

  return "Não foi possível concluir a operação.";
}

export function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [legalName, setLegalName] = useState("");
  const [tradeName, setTradeName] = useState("");
  const [document, setDocument] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [contactName, setContactName] = useState("");
  const [notes, setNotes] = useState("");
  const [isActive, setIsActive] = useState(true);

  const loadClients = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await getClients();
      setClients(data);
    } catch (error) {
      setErrorMessage(extractApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadClients();
  }, []);

  const resetForm = () => {
    setLegalName("");
    setTradeName("");
    setDocument("");
    setEmail("");
    setPhone("");
    setContactName("");
    setNotes("");
    setIsActive(true);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      await createClient({
        legalName,
        tradeName,
        document,
        email,
        phone,
        contactName,
        notes,
        isActive,
      });

      setSuccessMessage("Cliente cadastrado com sucesso.");
      resetForm();
      await loadClients();
    } catch (error) {
      setErrorMessage(extractApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" fontWeight={700}>
          Clientes
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          Cadastro operacional inicial para alimentar os pedidos.
        </Typography>
      </Box>

      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
      {successMessage ? (
        <Alert severity="success">{successMessage}</Alert>
      ) : null}

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack component="form" spacing={2.5} onSubmit={handleSubmit}>
          <Typography variant="h6" fontWeight={700}>
            Novo cliente
          </Typography>

          <TextField
            label="Razão social"
            value={legalName}
            onChange={(event) => setLegalName(event.target.value)}
            required
            fullWidth
            disabled={isSubmitting}
          />

          <TextField
            label="Nome fantasia"
            value={tradeName}
            onChange={(event) => setTradeName(event.target.value)}
            fullWidth
            disabled={isSubmitting}
          />

          <TextField
            label="CPF/CNPJ"
            value={document}
            onChange={(event) => setDocument(event.target.value)}
            required
            fullWidth
            disabled={isSubmitting}
          />

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              label="E-mail"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              fullWidth
              disabled={isSubmitting}
            />

            <TextField
              label="Telefone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              fullWidth
              disabled={isSubmitting}
            />
          </Stack>

          <TextField
            label="Contato principal"
            value={contactName}
            onChange={(event) => setContactName(event.target.value)}
            fullWidth
            disabled={isSubmitting}
          />

          <TextField
            label="Observações"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            fullWidth
            multiline
            minRows={3}
            disabled={isSubmitting}
          />

          <Stack direction="row" spacing={1} alignItems="center">
            <Switch
              checked={isActive}
              onChange={(_, checked) => setIsActive(checked)}
              disabled={isSubmitting}
            />
            <Typography variant="body2">Cliente ativo</Typography>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Cadastrar cliente"}
            </Button>

            <Button
              type="button"
              variant="outlined"
              onClick={resetForm}
              disabled={isSubmitting}
            >
              Limpar
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack spacing={2}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", md: "center" }}
            spacing={2}
          >
            <Typography variant="h6" fontWeight={700}>
              Lista de clientes
            </Typography>

            <Button
              variant="outlined"
              onClick={() => void loadClients()}
              disabled={isLoading}
            >
              Atualizar
            </Button>
          </Stack>

          {isLoading ? (
            <Stack direction="row" spacing={2} alignItems="center">
              <CircularProgress size={22} />
              <Typography variant="body2" color="text.secondary">
                Carregando clientes...
              </Typography>
            </Stack>
          ) : clients.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Nenhum cliente cadastrado.
            </Typography>
          ) : (
            <Stack spacing={2}>
              {clients.map((client) => (
                <Paper
                  key={client.id}
                  variant="outlined"
                  sx={{ p: 2, borderRadius: 2 }}
                >
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    justifyContent="space-between"
                    spacing={2}
                  >
                    <Stack spacing={0.5}>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {client.tradeName || client.legalName}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        Razão social: {client.legalName}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        Documento: {client.document}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        E-mail: {client.email || "-"}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        Telefone: {client.phone || "-"}
                      </Typography>
                    </Stack>

                    <Box>
                      <Chip
                        label={client.isActive ? "Ativo" : "Inativo"}
                        color={client.isActive ? "success" : "default"}
                        variant="outlined"
                      />
                    </Box>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
