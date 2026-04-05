import { Box, Button, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export function NotFoundPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        px: 2,
      }}
    >
      <Stack spacing={2} alignItems="center" textAlign="center" maxWidth={480}>
        <Typography variant="h3" fontWeight={700}>
          404
        </Typography>

        <Typography variant="h5" fontWeight={600}>
          Página não encontrada
        </Typography>

        <Typography variant="body1" color="text.secondary">
          A rota informada não existe ou ainda não foi implementada nesta fase
          inicial do FluxoOps.
        </Typography>

        <Button component={RouterLink} to="/orders" variant="contained">
          Ir para pedidos
        </Button>
      </Stack>
    </Box>
  );
}
