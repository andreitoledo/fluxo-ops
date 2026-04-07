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
import { dashboardService } from "../../features/dashboard/dashboard.service";
import type { DashboardOverview } from "../../types/dashboard";
import type { OrderStatus } from "../../types/orders";
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

  return "Não foi possível carregar o dashboard.";
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

function MetricCard(props: {
  title: string;
  value: string | number;
  subtitle?: string;
}) {
  const { title, value, subtitle } = props;

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Stack spacing={1}>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h5" fontWeight={700}>
          {value}
        </Typography>
        {subtitle ? (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        ) : null}
      </Stack>
    </Paper>
  );
}

export function DashboardPage() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadDashboard = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await dashboardService.getOverview();
      setOverview(data);
    } catch (error) {
      setErrorMessage(extractApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  const productionOverdueCount = useMemo(
    () => overview?.overdue.production.length ?? 0,
    [overview],
  );

  const shippingOverdueCount = useMemo(
    () => overview?.overdue.shipping.length ?? 0,
    [overview],
  );

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: "column", lg: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", lg: "center" }}
        spacing={2}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Dashboard operacional
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Visão gerencial do fluxo de pedidos, produção e expedição.
          </Typography>
        </Box>

        <Button variant="outlined" onClick={() => void loadDashboard()}>
          Atualizar
        </Button>
      </Stack>

      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      {isLoading ? (
        <Paper sx={{ p: 4, borderRadius: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <CircularProgress size={22} />
            <Typography variant="body2" color="text.secondary">
              Carregando dashboard...
            </Typography>
          </Stack>
        </Paper>
      ) : !overview ? (
        <Paper sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Nenhum dado disponível no momento.
          </Typography>
        </Paper>
      ) : (
        <>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                xl: "repeat(4, minmax(0, 1fr))",
              },
              gap: 2,
            }}
          >
            <MetricCard
              title="Total de pedidos"
              value={overview.kpis.totalOrders}
              subtitle={`Atualizado em ${formatDateTime(overview.generatedAt)}`}
            />
            <MetricCard
              title="Faturamento total"
              value={formatCurrency(overview.kpis.totalRevenue)}
            />
            <MetricCard
              title="Aguardando pagamento"
              value={overview.kpis.waitingPaymentCount}
            />
            <MetricCard
              title="Em produção"
              value={overview.kpis.inProductionCount}
            />
            <MetricCard
              title="Prontos para expedir"
              value={overview.kpis.readyToShipCount}
            />
            <MetricCard
              title="Concluídos"
              value={overview.kpis.completedCount}
            />
            <MetricCard
              title="Atrasos totais"
              value={overview.kpis.overdueCount}
              subtitle={`${productionOverdueCount} de produção / ${shippingOverdueCount} de expedição`}
            />
          </Box>

          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight={700}>
                Pedidos por status
              </Typography>

              <Stack direction="row" spacing={1.5} flexWrap="wrap">
                {overview.ordersByStatus.map((entry) => (
                  <Chip
                    key={entry.status}
                    label={`${getOrderStatusLabel(entry.status)}: ${entry.count}`}
                    variant="outlined"
                  />
                ))}
              </Stack>
            </Stack>
          </Paper>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                xl: "repeat(2, minmax(0, 1fr))",
              },
              gap: 2,
            }}
          >
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Stack spacing={2}>
                <Typography variant="h6" fontWeight={700}>
                  Fila de produção
                </Typography>

                {overview.queues.production.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Nenhum pedido aguardando produção no momento.
                  </Typography>
                ) : (
                  <Stack spacing={2}>
                    {overview.queues.production.map((order) => (
                      <Paper
                        key={order.id}
                        variant="outlined"
                        sx={{ p: 2, borderRadius: 2 }}
                      >
                        <Stack spacing={0.75}>
                          <Typography variant="subtitle2" fontWeight={700}>
                            {order.orderNumber}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Cliente: {order.client.tradeName || order.client.legalName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Status: {getOrderStatusLabel(order.status)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Produção prevista: {formatDate(order.productionDueDate)}
                          </Typography>
                          <Button
                            component={RouterLink}
                            to={`/orders/${order.id}`}
                            variant="text"
                            sx={{ alignSelf: "flex-start", px: 0 }}
                          >
                            Abrir pedido
                          </Button>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Stack>
            </Paper>

            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Stack spacing={2}>
                <Typography variant="h6" fontWeight={700}>
                  Fila de expedição
                </Typography>

                {overview.queues.shipping.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Nenhum pedido pronto para expedir no momento.
                  </Typography>
                ) : (
                  <Stack spacing={2}>
                    {overview.queues.shipping.map((order) => (
                      <Paper
                        key={order.id}
                        variant="outlined"
                        sx={{ p: 2, borderRadius: 2 }}
                      >
                        <Stack spacing={0.75}>
                          <Typography variant="subtitle2" fontWeight={700}>
                            {order.orderNumber}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Cliente: {order.client.tradeName || order.client.legalName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Expedição prevista: {formatDate(order.shippingDueDate)}
                          </Typography>
                          <Button
                            component={RouterLink}
                            to={`/orders/${order.id}`}
                            variant="text"
                            sx={{ alignSelf: "flex-start", px: 0 }}
                          >
                            Abrir pedido
                          </Button>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Stack>
            </Paper>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                xl: "repeat(2, minmax(0, 1fr))",
              },
              gap: 2,
            }}
          >
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Stack spacing={2}>
                <Typography variant="h6" fontWeight={700}>
                  Atrasados de produção
                </Typography>

                {overview.overdue.production.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Nenhum atraso de produção identificado.
                  </Typography>
                ) : (
                  <Stack spacing={2}>
                    {overview.overdue.production.map((order) => (
                      <Paper
                        key={order.id}
                        variant="outlined"
                        sx={{ p: 2, borderRadius: 2 }}
                      >
                        <Typography variant="subtitle2" fontWeight={700}>
                          {order.orderNumber}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Cliente: {order.client.tradeName || order.client.legalName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Status: {getOrderStatusLabel(order.status)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Produção prevista: {formatDate(order.productionDueDate)}
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
                  Atrasados de expedição
                </Typography>

                {overview.overdue.shipping.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Nenhum atraso de expedição identificado.
                  </Typography>
                ) : (
                  <Stack spacing={2}>
                    {overview.overdue.shipping.map((order) => (
                      <Paper
                        key={order.id}
                        variant="outlined"
                        sx={{ p: 2, borderRadius: 2 }}
                      >
                        <Typography variant="subtitle2" fontWeight={700}>
                          {order.orderNumber}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Cliente: {order.client.tradeName || order.client.legalName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Status: {getOrderStatusLabel(order.status)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Expedição prevista: {formatDate(order.shippingDueDate)}
                        </Typography>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Stack>
            </Paper>
          </Box>

          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight={700}>
                Últimos eventos de auditoria
              </Typography>

              {overview.recentAuditLogs.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Nenhum evento de auditoria registrado até o momento.
                </Typography>
              ) : (
                <Stack spacing={2}>
                  {overview.recentAuditLogs.map((entry) => (
                    <Paper
                      key={entry.id}
                      variant="outlined"
                      sx={{ p: 2, borderRadius: 2 }}
                    >
                      <Stack spacing={0.75}>
                        <Typography variant="subtitle2" fontWeight={700}>
                          {getAuditActionLabel(entry.action)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {entry.description}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Usuário: {entry.user?.name || "-"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Pedido: {entry.order?.orderNumber || "-"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Em: {formatDateTime(entry.createdAt)}
                        </Typography>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Stack>
          </Paper>
        </>
      )}
    </Stack>
  );
}