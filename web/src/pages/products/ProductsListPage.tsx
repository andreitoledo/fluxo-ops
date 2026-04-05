import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import {
  createProduct,
  getProducts,
} from "../../features/products/products.service";
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

  return "Não foi possível concluir a operação.";
}

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [productionLeadTimeDays, setProductionLeadTimeDays] = useState("");
  const [isActive, setIsActive] = useState(true);

  const loadProducts = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      setErrorMessage(extractApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadProducts();
  }, []);

  const resetForm = () => {
    setName("");
    setSku("");
    setDescription("");
    setBasePrice("");
    setProductionLeadTimeDays("");
    setIsActive(true);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      await createProduct({
        name,
        sku,
        description,
        basePrice: Number(basePrice),
        productionLeadTimeDays: productionLeadTimeDays
          ? Number(productionLeadTimeDays)
          : undefined,
        isActive,
      });

      setSuccessMessage("Produto cadastrado com sucesso.");
      resetForm();
      await loadProducts();
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
          Produtos
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          Cadastro operacional inicial para alimentar os itens do pedido.
        </Typography>
      </Box>

      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
      {successMessage ? (
        <Alert severity="success">{successMessage}</Alert>
      ) : null}

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack component="form" spacing={2.5} onSubmit={handleSubmit}>
          <Typography variant="h6" fontWeight={700}>
            Novo produto
          </Typography>

          <TextField
            label="Nome"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            fullWidth
            disabled={isSubmitting}
          />

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              label="SKU"
              value={sku}
              onChange={(event) => setSku(event.target.value)}
              required
              fullWidth
              disabled={isSubmitting}
            />

            <TextField
              label="Preço base"
              type="number"
              value={basePrice}
              onChange={(event) => setBasePrice(event.target.value)}
              required
              fullWidth
              disabled={isSubmitting}
              inputProps={{ min: 0, step: "0.01" }}
            />
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              label="Prazo padrão de produção (dias)"
              type="number"
              value={productionLeadTimeDays}
              onChange={(event) =>
                setProductionLeadTimeDays(event.target.value)
              }
              fullWidth
              disabled={isSubmitting}
              inputProps={{ min: 0, step: "1" }}
            />

            <Box sx={{ display: "flex", alignItems: "center", px: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Switch
                  checked={isActive}
                  onChange={(_, checked) => setIsActive(checked)}
                  disabled={isSubmitting}
                />
                <Typography variant="body2">Produto ativo</Typography>
              </Stack>
            </Box>
          </Stack>

          <TextField
            label="Descrição"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            fullWidth
            multiline
            minRows={3}
            disabled={isSubmitting}
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Cadastrar produto"}
            </Button>

            <Button
              type="button"
              variant="outlined"
              onClick={resetForm}
              disabled={isSubmitting}
            >
              Limpar
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack spacing={2}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", md: "center" }}
            spacing={2}
          >
            <Typography variant="h6" fontWeight={700}>
              Lista de produtos
            </Typography>

            <Button
              variant="outlined"
              onClick={() => void loadProducts()}
              disabled={isLoading}
            >
              Atualizar
            </Button>
          </Stack>

          {isLoading ? (
            <Stack direction="row" spacing={2} alignItems="center">
              <CircularProgress size={22} />
              <Typography variant="body2" color="text.secondary">
                Carregando produtos...
              </Typography>
            </Stack>
          ) : products.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Nenhum produto cadastrado.
            </Typography>
          ) : (
            <Stack spacing={2}>
              {products.map((product) => (
                <Paper
                  key={product.id}
                  variant="outlined"
                  sx={{ p: 2, borderRadius: 2 }}
                >
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    justifyContent="space-between"
                    spacing={2}
                  >
                    <Stack spacing={0.5}>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {product.name}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        SKU: {product.sku}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        Preço base: {formatCurrency(product.basePrice)}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        Prazo padrão: {product.productionLeadTimeDays ?? 0}{" "}
                        dia(s)
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        Descrição: {product.description || "-"}
                      </Typography>
                    </Stack>

                    <Box>
                      <Chip
                        label={product.isActive ? "Ativo" : "Inativo"}
                        color={product.isActive ? "success" : "default"}
                        variant="outlined"
                      />
                    </Box>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
