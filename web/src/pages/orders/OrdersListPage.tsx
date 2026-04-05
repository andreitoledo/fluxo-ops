import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const mockOrders = [
  {
    id: "9a70ed6e-7f39-460d-a07a-7588e00d96f6",
    orderNumber: "PED-20260404113119-EPOH",
    clientName: "Empresa Alpha Ltda",
    status: "DRAFT",
    totalAmount: "499,00",
  },
];

export function OrdersListPage() {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" fontWeight={700}>
          Pedidos
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          Base inicial da operação de pedidos. A integração com a API entra no
          próximo patch do frontend.
        </Typography>
      </Box>

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "center" }}
          spacing={2}
        >
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Lista inicial
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Estrutura pronta para evoluir para tabela real com filtros.
            </Typography>
          </Box>

          <Button variant="contained" disabled>
            Novo pedido
          </Button>
        </Stack>
      </Paper>

      <Stack spacing={2}>
        {mockOrders.map((order) => (
          <Paper
            key={order.id}
            sx={{
              p: 3,
              borderRadius: 3,
            }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              spacing={2}
            >
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  {order.orderNumber}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Cliente: {order.clientName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total: R$ {order.totalAmount}
                </Typography>
              </Box>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                alignItems={{ xs: "stretch", sm: "center" }}
              >
                <Chip label={order.status} color="warning" variant="outlined" />
                <Button
                  component={RouterLink}
                  to={`/orders/${order.id}`}
                  variant="contained"
                >
                  Ver detalhe
                </Button>
              </Stack>
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Stack>
  );
}
