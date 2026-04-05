import { http } from "../../services/http";
import type { CreateProductInput, Product } from "../../types/products";

export async function getProducts() {
  const { data } = await http.get<Product[]>("/products");
  return data;
}

export async function createProduct(input: CreateProductInput) {
  const payload = {
    ...input,
    name: input.name.trim(),
    sku: input.sku.trim().toUpperCase(),
    description: input.description?.trim() || undefined,
    productionLeadTimeDays:
      input.productionLeadTimeDays !== undefined &&
      Number.isNaN(input.productionLeadTimeDays)
        ? undefined
        : input.productionLeadTimeDays,
  };

  const { data } = await http.post<Product>("/products", payload);
  return data;
}
