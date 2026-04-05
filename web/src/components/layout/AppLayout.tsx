import {
  AppBar,
  Box,
  Button,
  Container,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { Outlet, useNavigate } from "react-router-dom";
import { authStorage } from "../../utils/auth-storage";

export function AppLayout() {
  const navigate = useNavigate();
  const user = authStorage.getUser();

  const handleLogout = () => {
    authStorage.clear();
    navigate("/login", { replace: true });
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={2}
            sx={{ width: "100%" }}
          >
            <Box>
              <Typography variant="h6" fontWeight={700}>
                FluxoOps
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Pedidos, Produção e Expedição
              </Typography>
            </Box>

            <Stack direction="row" spacing={2} alignItems="center">
              <Box textAlign="right">
                <Typography variant="body2" fontWeight={600}>
                  {user?.name ?? "Usuário autenticado"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.email ?? "sem e-mail"}
                </Typography>
              </Box>

              <Button variant="outlined" color="inherit" onClick={handleLogout}>
                Sair
              </Button>
            </Stack>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
