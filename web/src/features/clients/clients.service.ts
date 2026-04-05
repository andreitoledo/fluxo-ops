import { http } from "../../services/http";
import type { Client, CreateClientInput } from "../../types/clients";

export async function getClients() {
  const { data } = await http.get<Client[]>("/clients");
  return data;
}

export async function createClient(input: CreateClientInput) {
  const payload = {
    ...input,
    legalName: input.legalName.trim(),
    tradeName: input.tradeName?.trim() || undefined,
    document: input.document.trim(),
    email: input.email?.trim() || undefined,
    phone: input.phone?.trim() || undefined,
    contactName: input.contactName?.trim() || undefined,
    notes: input.notes?.trim() || undefined,
  };

  const { data } = await http.post<Client>("/clients", payload);
  return data;
}
