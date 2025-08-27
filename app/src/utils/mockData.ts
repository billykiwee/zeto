import { Contract, Company } from '../models/types';

export const mockContract: Contract = {
  id: "CTR001",
  ownerId: "USR001",
  companyId: "CMP001",
  product: "module",
  productId: "M001",
  price: 299.99,
  paymentFrequency: "monthly",
  pdf: "https://example.com/contract.pdf",
  createdAt: "2024-03-01T10:00:00Z"
};

export const mockCompany: Company = {
  userId: "USR001",
  id: "CMP001",
  name: "GameTech Solutions",
  email: "contact@gametech.com",
  phone: "+33 1 23 45 67 89",
  address: "123 Rue de la République, 75001 Paris",
  billingAddress: "123 Rue de la République, 75001 Paris",
  siret: "123 456 789 00012",
  vatNumber: "FR 12 345678900",
  accountHolder: "GameTech Solutions SAS",
  RIB: "FR76 3000 1007 1234 5678 9012 345",
  BIC: "BNPAFRPP",
  interests: ["gaming", "technology", "entertainment"],
  createdAt: "2024-01-01T00:00:00Z"
};