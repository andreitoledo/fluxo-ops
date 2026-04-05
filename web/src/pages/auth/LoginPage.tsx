import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

export function LoginPage() {
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
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4" fontWeight={700}>
                FluxoOps
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                Sistema de Pedidos, Produção e Expedição
              </Typography>
            </Box>

            <Alert severity="info">
              Login visual inicial. A integração real com JWT entra no próximo
              patch de autenticação do frontend.
            </Alert>

            <TextField label="E-mail" fullWidth />
            <TextField label="Senha" type="password" fullWidth />

            <Button variant="contained" size="large" fullWidth>
              Entrar
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
