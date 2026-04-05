import { useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { getClients } from "../../features/clients/clients.service";
import { ordersService } from "../../features/orders/orders.service";
import { getProducts } from "../../features/products/products.service";
import type { OrderSummary, OrderStatus } from "../../types/orders";
import { formatCurrency, formatDate } from "../../utils/format";

function getOrderStatusChipColor(status: OrderStatus) {
  switch (status) {
    case "DRAFT":
      return "warning";
    case "WAITING_PAYMENT":
      return "default";
    case "PAYMENT_APPROVED":
      return "info";
    case "IN_PRODUCTION":
      return "primary";
    case "READY_TO_SHIP":
      return "secondary";
    case "SHIPPED":
      return "success";
    case "COMPLETED":
      return "success";
    case "CANCELED":
      return "error";
    default:
      return "default";
  }
}

function getOrderStatusLabel(status: OrderStatus) {
  switch (status) {
    case "DRAFT":
      return "Rascunho";
    case "WAITING_PAYMENT":
      return "Aguardando pagamento";
    case "PAYMENT_APPROVED":
      return "Pagamento aprovado";
    case "IN_PRODUCTION":
      return "Em produção";
    case "READY_TO_SHIP":
      return "Pronto para expedir";
    case "SHIPPED":
      return "Expedido";
    case "COMPLETED":
      return "Concluído";
    case "CANCELED":
      return "Cancelado";
    default:
      return status;
  }
}

function extractApiErrorMessage(error: unknown) {
  const axiosError = error as AxiosError<{ message?: string | string[] }>;
  const apiMessage = axiosError.response?.data?.message;

  if (Array.isArray(apiMessage)) {
    return apiMessage.join(" ");
  }

  if (typeof apiMessage === "string") {
    return apiMessage;
  }

  return "Não foi possível carregar os pedidos.";
}

export function OrdersListPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [clientsCount, setClientsCount] = useState(0);
  const [productsCount, setProductsCount] = useState(0);

  const totalOrders = orders.length;
  const draftOrders = useMemo(
    () => orders.filter((order) => order.status === "DRAFT").length,
    [orders],
  );
  const waitingPaymentOrders = useMemo(
    () => orders.filter((order) => order.status === "WAITING_PAYMENT").length,
    [orders],
  );
  const inProductionOrders = useMemo(
    () => orders.filter((order) => order.status === "IN_PRODUCTION").length,
    [orders],
  );

  const canCreateOrder = clientsCount > 0 && productsCount > 0;

  const loadOrders = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [ordersData, clientsData, productsData] = await Promise.all([
        ordersService.getAll(),
        getClients(),
        getProducts(),
      ]);

      setOrders(ordersData);
      setClientsCount(clientsData.filter((client) => client.isActive).length);
      setProductsCount(
        productsData.filter((product) => product.isActive).length,
      );
    } catch (error) {
      setErrorMessage(extractApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadOrders();
  }, []);

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" fontWeight={700}>
          Pedidos
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          Lista operacional consumindo a API real do backend.
        </Typography>
      </Box>

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack
          direction={{ xs: "column", lg: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", lg: "center" }}
          spacing={2}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            flexWrap="wrap"
          >
            <Chip label={`Total: ${totalOrders}`} variant="outlined" />
            <Chip
              label={`Rascunhos: ${draftOrders}`}
              color="warning"
              variant="outlined"
            />
            <Chip
              label={`Aguardando pagamento: ${waitingPaymentOrders}`}
              variant="outlined"
            />
            <Chip
              label={`Em produção: ${inProductionOrders}`}
              color="primary"
              variant="outlined"
            />
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Button
              variant="outlined"
              onClick={() => void loadOrders()}
              disabled={isLoading}
            >
              Atualizar
            </Button>

            <Button
              component={RouterLink}
              to="/orders/new"
              variant="contained"
              disabled={!canCreateOrder}
            >
              Novo pedido
            </Button>
          </Stack>
        </Stack>

        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} mt={2}>
          <Typography variant="caption" color="text.secondary">
            Clientes ativos: {clientsCount}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Produtos ativos: {productsCount}
          </Typography>
        </Stack>

        {!canCreateOrder ? (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Para criar um pedido, é necessário ter ao menos 1 cliente ativo e 1
            produto ativo.
          </Alert>
        ) : null}
      </Paper>

      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      {isLoading ? (
        <Paper sx={{ p: 4, borderRadius: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <CircularProgress size={22} />
            <Typography variant="body2" color="text.secondary">
              Carregando pedidos...
            </Typography>
          </Stack>
        </Paper>
      ) : orders.length === 0 ? (
        <Paper sx={{ p: 4, borderRadius: 3 }}>
          <Stack spacing={1}>
            <Typography variant="h6" fontWeight={700}>
              Nenhum pedido encontrado
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cadastre clientes e produtos para começar a operar os pedidos.
            </Typography>
          </Stack>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {orders.map((order) => (
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
                <Stack spacing={0.75}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {order.orderNumber}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Cliente: {order.client.tradeName || order.client.legalName}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Total: {formatCurrency(order.totalAmount)}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Pagamento: {order.paymentStatus}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Produção prevista: {formatDate(order.productionDueDate)}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Expedição prevista: {formatDate(order.shippingDueDate)}
                  </Typography>
                </Stack>

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  alignItems={{ xs: "stretch", sm: "center" }}
                >
                  <Chip
                    label={getOrderStatusLabel(order.status)}
                    color={getOrderStatusChipColor(order.status)}
                    variant="outlined"
                  />

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
      )}
    </Stack>
  );
}
