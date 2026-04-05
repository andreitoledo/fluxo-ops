export interface Client {
  id: string;
  legalName: string;
  tradeName?: string | null;
  document: string;
  email?: string | null;
  phone?: string | null;
  contactName?: string | null;
  notes?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientInput {
  legalName: string;
  tradeName?: string;
  document: string;
  email?: string;
  phone?: string;
  contactName?: string;
  notes?: string;
  isActive?: boolean;
}