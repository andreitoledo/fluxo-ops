import { useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useParams } from "react-router-dom";
import { ordersService } from "../../features/orders/orders.service";
import type {
  OrderDetail,
  OrderStatus,
  PaymentStatus,
} from "../../types/orders";
import { authStorage } from "../../utils/auth-storage";
import { formatCurrency, formatDate, formatDateTime } from "../../utils/format";

function extractApiErrorMessage(error: unknown) {
  const axiosError = error as AxiosError<{ message?: string | string[] }>;
  const apiMessage = axiosError.response?.data?.message;

  if (Array.isArray(apiMessage)) {
    return apiMessage.join(" ");
  }

  if (typeof apiMessage === "string") {
    return apiMessage;
  }

  if (axiosError.response?.status) {
    return `Operação não concluída. HTTP ${axiosError.response.status}.`;
  }

  return "Não foi possível carregar/processar o pedido.";
}

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

function getPaymentStatusLabel(status: PaymentStatus) {
  switch (status) {
    case "PENDING":
      return "Pendente";
    case "APPROVED":
      return "Aprovado";
    case "REJECTED":
      return "Rejeitado";
    default:
      return status;
  }
}

export function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const user = authStorage.getUser();

  const canApproveOrRejectPayment = useMemo(() => {
    if (!order || !user) {
      return false;
    }

    const allowedRole = user.role === "ADMIN" || user.role === "FINANCIAL";
    const allowedStatus =
      order.status === "DRAFT" ||
      order.status === "WAITING_PAYMENT" ||
      order.status === "PAYMENT_APPROVED";

    return allowedRole && allowedStatus;
  }, [order, user]);

  const loadOrder = async () => {
    if (!id) {
      setErrorMessage("Pedido inválido.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await ordersService.getById(id);
      setOrder(data);
    } catch (error) {
      setErrorMessage(extractApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadOrder();
  }, [id]);

  const handleApprovePayment = async () => {
    if (!id) {
      return;
    }

    setIsSubmittingPayment(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const updatedOrder = await ordersService.approvePayment(id);
      setOrder(updatedOrder);
      setSuccessMessage("Pagamento aprovado com sucesso.");
    } catch (error) {
      setErrorMessage(extractApiErrorMessage(error));
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const handleRejectPayment = async () => {
    if (!id) {
      return;
    }

    setIsSubmittingPayment(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const updatedOrder = await ordersService.rejectPayment(id);
      setOrder(updatedOrder);
      setSuccessMessage("Pagamento reprovado com sucesso.");
    } catch (error) {
      setErrorMessage(extractApiErrorMessage(error));
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  if (isLoading) {
    return (
      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <CircularProgress size={22} />
          <Typography variant="body2" color="text.secondary">
            Carregando pedido...
          </Typography>
        </Stack>
      </Paper>
    );
  }

  if (!order) {
    return (
      <Stack spacing={3}>
        {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
        <Button component={RouterLink} to="/orders" variant="outlined">
          Voltar para pedidos
        </Button>
      </Stack>
    );
  }

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
            Pedido selecionado: {order.id}
          </Typography>
        </Box>

        <Button component={RouterLink} to="/orders" variant="outlined">
          Voltar para pedidos
        </Button>
      </Stack>

      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
      {successMessage ? (
        <Alert severity="success">{successMessage}</Alert>
      ) : null}

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack spacing={2}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            spacing={2}
          >
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {order.orderNumber}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cliente: {order.client.tradeName || order.client.legalName}
              </Typography>
            </Box>

            <Chip
              label={getOrderStatusLabel(order.status)}
              color={getOrderStatusChipColor(order.status)}
              variant="outlined"
            />
          </Stack>

          <Divider />

          <Stack spacing={1}>
            <Typography variant="body2">
              <strong>Total:</strong> {formatCurrency(order.totalAmount)}
            </Typography>
            <Typography variant="body2">
              <strong>Pagamento:</strong>{" "}
              {getPaymentStatusLabel(order.paymentStatus)}
            </Typography>
            <Typography variant="body2">
              <strong>Produção prevista:</strong>{" "}
              {formatDate(order.productionDueDate)}
            </Typography>
            <Typography variant="body2">
              <strong>Expedição prevista:</strong>{" "}
              {formatDate(order.shippingDueDate)}
            </Typography>
            <Typography variant="body2">
              <strong>Criado em:</strong> {formatDateTime(order.createdAt)}
            </Typography>
            <Typography variant="body2">
              <strong>Observações:</strong> {order.internalNotes || "-"}
            </Typography>
          </Stack>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h6" fontWeight={700}>
            Itens do pedido
          </Typography>

          {order.items.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Nenhum item cadastrado neste pedido.
            </Typography>
          ) : (
            <Stack spacing={2}>
              {order.items.map((item) => (
                <Paper
                  key={item.id}
                  variant="outlined"
                  sx={{ p: 2, borderRadius: 2 }}
                >
                  <Typography variant="subtitle2" fontWeight={700}>
                    {item.productNameSnapshot}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Quantidade: {item.quantity}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Preço unitário: {formatCurrency(item.unitPrice)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Subtotal: {formatCurrency(item.subtotal)}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          )}
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h6" fontWeight={700}>
            Ações rápidas
          </Typography>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <Button
              variant="contained"
              onClick={handleApprovePayment}
              disabled={!canApproveOrRejectPayment || isSubmittingPayment}
            >
              {isSubmittingPayment ? "Processando..." : "Aprovar pagamento"}
            </Button>

            <Button
              variant="outlined"
              onClick={handleRejectPayment}
              disabled={!canApproveOrRejectPayment || isSubmittingPayment}
            >
              {isSubmittingPayment ? "Processando..." : "Reprovar pagamento"}
            </Button>

            <Button variant="outlined" disabled>
              Iniciar produção
            </Button>

            <Button variant="outlined" disabled>
              Expedir pedido
            </Button>
          </Stack>

          <Typography variant="caption" color="text.secondary">
            Pagamento já integrado ao backend. Produção e expedição permanecem
            desabilitados até os próximos patches do workflow.
          </Typography>
        </Stack>
      </Paper>
    </Stack>
  );
}
