import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { AxiosError } from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { authService } from "../../services/auth/auth.service";
import { authStorage } from "../../utils/auth-storage";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as { from?: { pathname?: string } } | null;
  const redirectTo = state?.from?.pathname ?? "/orders";

  const [email, setEmail] = useState("admin@fluxoops.local");
  const [password, setPassword] = useState("123456");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await authService.login({
        email: email.trim(),
        password,
      });

      authStorage.setToken(response.accessToken);
      authStorage.setUser(response.user);

      navigate(redirectTo, { replace: true });
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string | string[] }>;
      const apiMessage = axiosError.response?.data?.message;

      if (Array.isArray(apiMessage)) {
        setErrorMessage(apiMessage.join(" "));
      } else if (typeof apiMessage === "string") {
        setErrorMessage(apiMessage);
      } else {
        setErrorMessage(
          "Não foi possível realizar o login. Verifique as credenciais.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        px: 2,
        bgcolor: "background.default",
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 420, borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack component="form" spacing={3} onSubmit={handleSubmit}>
            <Box>
              <Typography variant="h4" fontWeight={700}>
                FluxoOps
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                Sistema de Pedidos, Produção e Expedição
              </Typography>
            </Box>

            <Alert severity="info">
              Use o login do backend já semeado para entrar no sistema.
            </Alert>

            {errorMessage ? (
              <Alert severity="error">{errorMessage}</Alert>
            ) : null}

            <TextField
              label="E-mail"
              type="email"
              fullWidth
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              disabled={isSubmitting}
            />

            <TextField
              label="Senha"
              type="password"
              fullWidth
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              disabled={isSubmitting}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <CircularProgress size={18} color="inherit" />
                  <span>Entrando...</span>
                </Stack>
              ) : (
                "Entrar"
              )}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
