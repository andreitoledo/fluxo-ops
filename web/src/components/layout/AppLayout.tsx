import {
  AppBar,
  Box,
  Button,
  Container,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import {
  Link as RouterLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { authStorage } from "../../utils/auth-storage";

function getNavButtonVariant(currentPath: string, targetPath: string) {
  return currentPath.startsWith(targetPath) ? "contained" : "text";
}

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
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
            direction={{ xs: "column", lg: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", lg: "center" }}
            spacing={2}
            sx={{ width: "100%" }}
          >
            <Stack
              direction={{ xs: "column", lg: "row" }}
              spacing={2}
              alignItems={{ xs: "flex-start", lg: "center" }}
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

              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button
                  component={RouterLink}
                  to="/dashboard"
                  variant={getNavButtonVariant(location.pathname, "/dashboard")}
                  color="inherit"
                >
                  Dashboard
                </Button>
                <Button
                  component={RouterLink}
                  to="/orders"
                  variant={getNavButtonVariant(location.pathname, "/orders")}
                  color="inherit"
                >
                  Pedidos
                </Button>

                <Button
                  component={RouterLink}
                  to="/clients"
                  variant={getNavButtonVariant(location.pathname, "/clients")}
                  color="inherit"
                >
                  Clientes
                </Button>

                <Button
                  component={RouterLink}
                  to="/products"
                  variant={getNavButtonVariant(location.pathname, "/products")}
                  color="inherit"
                >
                  Produtos
                </Button>
              </Stack>
            </Stack>

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
