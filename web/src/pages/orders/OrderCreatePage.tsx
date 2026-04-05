import { useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { getClients } from "../../features/clients/clients.service";
import { ordersService } from "../../features/orders/orders.service";
import { getProducts } from "../../features/products/products.service";
import type { Client } from "../../types/clients";
import type { Product } from "../../types/products";
import { formatCurrency } from "../../utils/format";

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
    return `Não foi possível salvar o pedido. HTTP ${axiosError.response.status}.`;
  }

  return "Não foi possível salvar o pedido.";
}

export function OrderCreatePage() {
  const navigate = useNavigate();

  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [clientId, setClientId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [notes, setNotes] = useState("");

  const [isLoadingDependencies, setIsLoadingDependencies] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadDependencies() {
      setIsLoadingDependencies(true);
      setErrorMessage(null);

      try {
        const [clientsData, productsData] = await Promise.all([
          getClients(),
          getProducts(),
        ]);

        setClients(clientsData.filter((client) => client.isActive));
        setProducts(productsData.filter((product) => product.isActive));
      } catch (error) {
        setErrorMessage(extractApiErrorMessage(error));
      } finally {
        setIsLoadingDependencies(false);
      }
    }

    void loadDependencies();
  }, []);

  const selectedClient = useMemo(
    () => clients.find((client) => client.id === clientId) ?? null,
    [clientId, clients],
  );

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === productId) ?? null,
    [productId, products],
  );

  const quantityNumber = useMemo(() => {
    const parsed = Number(quantity);
    return Number.isFinite(parsed) ? parsed : 0;
  }, [quantity]);

  const totalPreview = useMemo(() => {
    if (!selectedProduct || quantityNumber <= 0) {
      return 0;
    }

    const unitPrice = Number(selectedProduct.basePrice) || 0;
    return quantityNumber * unitPrice;
  }, [quantityNumber, selectedProduct]);

  const canProceed = clients.length > 0 && products.length > 0;
  const isFormValid =
    canProceed &&
    !!clientId &&
    !!productId &&
    Number.isInteger(quantityNumber) &&
    quantityNumber > 0;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isFormValid || !selectedProduct) {
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const createdOrder = await ordersService.create({
        clientId,
        internalNotes: notes,
      });

      const updatedOrder = await ordersService.addItems(createdOrder.id, {
        items: [
          {
            productId,
            quantity: quantityNumber,
            unitPrice: Number(selectedProduct.basePrice),
          },
        ],
      });

      navigate(`/orders/${updatedOrder.id}`, { replace: true });
    } catch (error) {
      setErrorMessage(extractApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" fontWeight={700}>
          Novo pedido
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          Cadastro inicial de pedido com envio real para a API.
        </Typography>
      </Box>

      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack component="form" spacing={2.5} onSubmit={handleSubmit}>
          {!canProceed && !isLoadingDependencies ? (
            <Alert severity="warning">
              É necessário ter ao menos 1 cliente ativo e 1 produto ativo para
              iniciar o pedido.
            </Alert>
          ) : null}

          <TextField
            select
            label="Cliente"
            value={clientId}
            onChange={(event) => setClientId(event.target.value)}
            fullWidth
            disabled={!canProceed || isSubmitting || isLoadingDependencies}
            required
          >
            {clients.map((client) => (
              <MenuItem key={client.id} value={client.id}>
                {client.tradeName || client.legalName}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Produto"
            value={productId}
            onChange={(event) => setProductId(event.target.value)}
            fullWidth
            disabled={!canProceed || isSubmitting || isLoadingDependencies}
            required
          >
            {products.map((product) => (
              <MenuItem key={product.id} value={product.id}>
                {product.name} - {product.sku}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Quantidade"
            type="number"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            fullWidth
            disabled={!canProceed || isSubmitting || isLoadingDependencies}
            inputProps={{ min: 1, step: 1 }}
            required
          />

          <TextField
            label="Observações"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            fullWidth
            multiline
            minRows={3}
            disabled={!canProceed || isSubmitting || isLoadingDependencies}
          />

          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Stack spacing={0.75}>
              <Typography variant="subtitle1" fontWeight={700}>
                Prévia do pedido
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Cliente selecionado:{" "}
                {selectedClient?.tradeName || selectedClient?.legalName || "-"}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Produto selecionado: {selectedProduct?.name || "-"}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Quantidade: {quantityNumber || 0}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Total estimado: {formatCurrency(totalPreview)}
              </Typography>
            </Stack>
          </Paper>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Button
              type="submit"
              variant="contained"
              disabled={!isFormValid || isSubmitting || isLoadingDependencies}
            >
              {isSubmitting ? "Salvando..." : "Salvar pedido"}
            </Button>

            <Button
              component={RouterLink}
              to="/orders"
              variant="outlined"
              disabled={isSubmitting}
            >
              Voltar para pedidos
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}
