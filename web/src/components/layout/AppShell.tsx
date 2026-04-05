import LogoutIcon from "@mui/icons-material/Logout";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import {
  AppBar,
  Box,
  Button,
  Container,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { Link as RouterLink, Outlet, useNavigate } from "react-router-dom";
import { logout } from "../../features/auth/auth.service";

export function AppShell() {
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="sticky" color="transparent" elevation={0}>
        <Toolbar
          sx={{
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(8px)",
            bgcolor: "rgba(15, 23, 32, 0.88)",
          }}
        >
          <Container maxWidth="xl">
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              width="100%"
            >
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <ReceiptLongIcon color="primary" />
                <Typography variant="h6" fontWeight={700}>
                  FluxoOps
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1}>
                <Button component={RouterLink} to="/orders" color="inherit">
                  Pedidos
                </Button>
                <Button
                  color="inherit"
                  startIcon={<LogoutIcon />}
                  onClick={handleLogout}
                >
                  Sair
                </Button>
              </Stack>
            </Stack>
          </Container>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
