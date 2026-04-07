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

function getAuditActionLabel(action: string) {
  switch (action) {
    case "PAYMENT_APPROVED":
      return "Pagamento aprovado";
    case "PAYMENT_REJECTED":
      return "Pagamento rejeitado";
    case "ORDER_PRODUCTION_STARTED":
      return "Produção iniciada";
    case "ORDER_PRODUCTION_COMPLETED":
      return "Produção concluída";
    case "ORDER_SHIPPED":
      return "Pedido expedido";
    case "ORDER_COMPLETED":
      return "Pedido concluído";
    default:
      return action;
  }
}

export function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [workflowAction, setWorkflowAction] = useState<
    | "approvePayment"
    | "rejectPayment"
    | "startProduction"
    | "completeProduction"
    | "shipOrder"
    | "completeOrder"
    | null
  >(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const user = authStorage.getUser();

  const canManagePaymentRole = useMemo(() => {
    if (!user) {
      return false;
    }

    return user.role === "ADMIN" || user.role === "FINANCIAL";
  }, [user]);

  const canManageProductionRole = useMemo(() => {
    if (!user) {
      return false;
    }

    return user.role === "ADMIN" || user.role === "PRODUCTION";
  }, [user]);

  const canManageOperationsRole = useMemo(() => {
    if (!user) {
      return false;
    }

    return user.role === "ADMIN" || user.role === "OPERATIONS";
  }, [user]);

  const canApproveOrRejectPayment = useMemo(() => {
    if (!order || !canManagePaymentRole) {
      return false;
    }

    return (
      order.status === "DRAFT" ||
      order.status === "WAITING_PAYMENT" ||
      order.status === "PAYMENT_APPROVED"
    );
  }, [order, canManagePaymentRole]);

  const canStartProduction = useMemo(() => {
    if (!order || !canManageProductionRole) {
      return false;
    }

    return (
      order.status === "PAYMENT_APPROVED" && order.paymentStatus === "APPROVED"
    );
  }, [order, canManageProductionRole]);

  const canCompleteProduction = useMemo(() => {
    if (!order || !canManageProductionRole) {
      return false;
    }

    return order.status === "IN_PRODUCTION";
  }, [order, canManageProductionRole]);

  const canShipOrder = useMemo(() => {
    if (!order || !canManageOperationsRole) {
      return false;
    }

    return order.status === "READY_TO_SHIP";
  }, [order, canManageOperationsRole]);

  const canCompleteOrder = useMemo(() => {
    if (!order || !canManageOperationsRole) {
      return false;
    }

    return order.status === "SHIPPED";
  }, [order, canManageOperationsRole]);

  const isBusy = workflowAction !== null;

  const statusHistory = order?.statusHistory ?? [];
  const auditLogs = order?.auditLogs ?? [];

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

    setWorkflowAction("approvePayment");
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const updatedOrder = await ordersService.approvePayment(id);
      setOrder(updatedOrder);
      setSuccessMessage("Pagamento aprovado com sucesso.");
    } catch (error) {
      setErrorMessage(extractApiErrorMessage(error));
    } finally {
      setWorkflowAction(null);
    }
  };

  const handleRejectPayment = async () => {
    if (!id) {
      return;
    }

    setWorkflowAction("rejectPayment");
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const updatedOrder = await ordersService.rejectPayment(id);
      setOrder(updatedOrder);
      setSuccessMessage("Pagamento reprovado com sucesso.");
    } catch (error) {
      setErrorMessage(extractApiErrorMessage(error));
    } finally {
      setWorkflowAction(null);
    }
  };

  const handleStartProduction = async () => {
    if (!id) {
      return;
    }

    setWorkflowAction("startProduction");
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const updatedOrder = await ordersService.startProduction(id);
      setOrder(updatedOrder);
      setSuccessMessage("Produção iniciada com sucesso.");
    } catch (error) {
      setErrorMessage(extractApiErrorMessage(error));
    } finally {
      setWorkflowAction(null);
    }
  };

  const handleCompleteProduction = async () => {
    if (!id) {
      return;
    }

    setWorkflowAction("completeProduction");
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const updatedOrder = await ordersService.completeProduction(id);
      setOrder(updatedOrder);
      setSuccessMessage("Produção concluída com sucesso.");
    } catch (error) {
      setErrorMessage(extractApiErrorMessage(error));
    } finally {
      setWorkflowAction(null);
    }
  };

  const handleShipOrder = async () => {
    if (!id) {
      return;
    }

    setWorkflowAction("shipOrder");
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const updatedOrder = await ordersService.shipOrder(id);
      setOrder(updatedOrder);
      setSuccessMessage("Pedido expedido com sucesso.");
    } catch (error) {
      setErrorMessage(extractApiErrorMessage(error));
    } finally {
      setWorkflowAction(null);
    }
  };

  const handleCompleteOrder = async () => {
    if (!id) {
      return;
    }

    setWorkflowAction("completeOrder");
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const updatedOrder = await ordersService.completeOrder(id);
      setOrder(updatedOrder);
      setSuccessMessage("Pedido concluído com sucesso.");
    } catch (error) {
      setErrorMessage(extractApiErrorMessage(error));
    } finally {
      setWorkflowAction(null);
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
              <strong>Produção iniciada em:</strong>{" "}
              {formatDateTime(order.productionStartedAt)}
            </Typography>
            <Typography variant="body2">
              <strong>Produção concluída em:</strong>{" "}
              {formatDateTime(order.productionCompletedAt)}
            </Typography>
            <Typography variant="body2">
              <strong>Expedido em:</strong> {formatDateTime(order.shippedAt)}
            </Typography>
            <Typography variant="body2">
              <strong>Concluído em:</strong> {formatDateTime(order.completedAt)}
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

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            flexWrap="wrap"
          >
            {canManagePaymentRole ? (
              <>
                <Button
                  variant="contained"
                  onClick={handleApprovePayment}
                  disabled={!canApproveOrRejectPayment || isBusy}
                >
                  {workflowAction === "approvePayment"
                    ? "Processando..."
                    : "Aprovar pagamento"}
                </Button>

                <Button
                  variant="outlined"
                  onClick={handleRejectPayment}
                  disabled={!canApproveOrRejectPayment || isBusy}
                >
                  {workflowAction === "rejectPayment"
                    ? "Processando..."
                    : "Reprovar pagamento"}
                </Button>
              </>
            ) : null}

            {canManageProductionRole ? (
              <>
                <Button
                  variant="outlined"
                  onClick={handleStartProduction}
                  disabled={!canStartProduction || isBusy}
                >
                  {workflowAction === "startProduction"
                    ? "Processando..."
                    : "Iniciar produção"}
                </Button>

                <Button
                  variant="outlined"
                  onClick={handleCompleteProduction}
                  disabled={!canCompleteProduction || isBusy}
                >
                  {workflowAction === "completeProduction"
                    ? "Processando..."
                    : "Concluir produção"}
                </Button>
              </>
            ) : null}

            {canManageOperationsRole ? (
              <>
                <Button
                  variant="outlined"
                  onClick={handleShipOrder}
                  disabled={!canShipOrder || isBusy}
                >
                  {workflowAction === "shipOrder"
                    ? "Processando..."
                    : "Expedir pedido"}
                </Button>

                <Button
                  variant="outlined"
                  onClick={handleCompleteOrder}
                  disabled={!canCompleteOrder || isBusy}
                >
                  {workflowAction === "completeOrder"
                    ? "Processando..."
                    : "Concluir pedido"}
                </Button>
              </>
            ) : null}
          </Stack>

          <Typography variant="caption" color="text.secondary">
            As ações são habilitadas conforme o perfil do usuário e o status
            atual do pedido.
          </Typography>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h6" fontWeight={700}>
            Histórico de status
          </Typography>

          {statusHistory.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Nenhuma transição registrada até o momento.
            </Typography>
          ) : (
            <Stack spacing={2}>
              {statusHistory.map((entry) => (
                <Paper
                  key={entry.id}
                  variant="outlined"
                  sx={{ p: 2, borderRadius: 2 }}
                >
                  <Typography variant="subtitle2" fontWeight={700}>
                    {entry.previousStatus
                      ? `${getOrderStatusLabel(entry.previousStatus)} → ${getOrderStatusLabel(
                          entry.newStatus,
                        )}`
                      : getOrderStatusLabel(entry.newStatus)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Responsável: {entry.changedByUser?.name || "-"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Em: {formatDateTime(entry.createdAt)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Observação: {entry.note || "-"}
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
            Auditoria
          </Typography>

          {auditLogs.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Nenhum evento de auditoria registrado até o momento.
            </Typography>
          ) : (
            <Stack spacing={2}>
              {auditLogs.map((entry) => (
                <Paper
                  key={entry.id}
                  variant="outlined"
                  sx={{ p: 2, borderRadius: 2 }}
                >
                  <Typography variant="subtitle2" fontWeight={700}>
                    {getAuditActionLabel(entry.action)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Descrição: {entry.description}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Usuário: {entry.user?.name || "-"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Em: {formatDateTime(entry.createdAt)}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
