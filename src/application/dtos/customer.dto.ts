export interface CreateCustomerRequest {
  name: string;
  email: string;
  document: string;
  phone?: string;
  password?: string;
  metadata?: Record<string, any>;
}

export interface UpdateCustomerRequest {
  name?: string;
  email?: string;
  document?: string;
  phone?: string;
  password?: string;
  metadata?: Record<string, any>;
}

export interface CustomerResponse {
  id: string;
  name: string;
  email: string;
  document: string;
  phone: string | null;
  metadata: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerListResponse {
  customers: CustomerResponse[];
}

export interface CreateCustomerResponse {
  customer: CustomerResponse;
}

export interface GetCustomerResponse {
  customer: CustomerResponse;
}

export interface UpdateCustomerResponse {
  customer: CustomerResponse;
}

export interface DeleteCustomerResponse {
  customer: CustomerResponse;
}