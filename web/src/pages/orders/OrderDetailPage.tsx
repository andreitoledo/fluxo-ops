import {
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useParams } from "react-router-dom";

export function OrderDetailPage() {
  const { id } = useParams();

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "center" }}
        spacing={2}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Detalhe do pedido
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Pedido selecionado: {id}
          </Typography>
        </Box>

        <Button component={RouterLink} to="/orders" variant="outlined">
          Voltar para pedidos
        </Button>
      </Stack>

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack spacing={2}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            spacing={2}
          >
            <Box>
              <Typography variant="h6" fontWeight={700}>
                PED-20260404113119-EPOH
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cliente: Empresa Alpha Ltda
              </Typography>
            </Box>

            <Chip label="DRAFT" color="warning" variant="outlined" />
          </Stack>

          <Divider />

          <Stack spacing={1}>
            <Typography variant="body2">
              <strong>Total:</strong> R$ 499,00
            </Typography>
            <Typography variant="body2">
              <strong>Pagamento:</strong> PENDING
            </Typography>
            <Typography variant="body2">
              <strong>Produção prevista:</strong> 15/04/2026
            </Typography>
            <Typography variant="body2">
              <strong>Expedição prevista:</strong> 20/04/2026
            </Typography>
          </Stack>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h6" fontWeight={700}>
            Itens do pedido
          </Typography>

          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight={700}>
              Camiseta Premium
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Quantidade: 10
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Preço unitário: R$ 49,90
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Subtotal: R$ 499,00
            </Typography>
          </Paper>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h6" fontWeight={700}>
            Ações rápidas
          </Typography>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <Button variant="contained" disabled>
              Aprovar pagamento
            </Button>
            <Button variant="outlined" disabled>
              Reprovar pagamento
            </Button>
            <Button variant="outlined" disabled>
              Iniciar produção
            </Button>
            <Button variant="outlined" disabled>
              Expedir pedido
            </Button>
          </Stack>

          <Typography variant="caption" color="text.secondary">
            Botões visuais iniciais. As integrações reais entram nos próximos
            patches do frontend.
          </Typography>
        </Stack>
      </Paper>
    </Stack>
  );
}
