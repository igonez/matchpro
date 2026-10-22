// Configurações do SDK e Gateway Asaas
// Suporta ambiente Sandbox (testes) e Produção via variáveis de ambiente

export const ASAAS_CONFIG = {
  baseUrl: process.env.ASAAS_BASE_URL || 'https://sandbox.asaas.com/api/v3',
  apiKey: process.env.ASAAS_API_KEY || '',
  webhookSecret: process.env.ASAAS_WEBHOOK_SECRET || '',
  // Wallet ID da conta Master da plataforma ArenaFitPro
  platformWalletId: process.env.ASAAS_PLATFORM_WALLET_ID || '',
};

export interface AsaasCustomerInput {
  name: string;
  email: string;
  cpfCnpj: string;
  phone?: string;
  externalReference?: string;
  notificationDisabled?: boolean;
}

export interface AsaasPixChargeInput {
  customerId: string;
  value: number;
  description: string;
  dueDate?: string; // Formato YYYY-MM-DD
  externalReference: string;
  split?: {
    walletId: string;
    percentualValue?: number;
    fixedValue?: number;
  }[];
}

export interface AsaasPixQrCodeResponse {
  encodedImage: string; // Base64 da imagem do QR Code
  payload: string;      // Código copia e cola
  expirationDate: string;
}

export interface AsaasSubscriptionInput {
  customerId: string;
  billingType: 'PIX' | 'CREDIT_CARD';
  value: number;
  nextDueDate: string;
  cycle: 'MONTHLY' | 'YEARLY';
  description: string;
  creditCard?: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
  creditCardHolderInfo?: {
    name: string;
    email: string;
    cpfCnpj: string;
    postalCode: string;
    addressNumber: string;
    phone: string;
  };
}

export interface AsaasSubaccountInput {
  name: string;
  email: string;
  cpfCnpj: string;
  birthDate?: string;
  phone?: string;
  mobilePhone?: string;
  incomeValue?: number;
  companyType?: string;
  address?: string;
  addressNumber?: string;
  province?: string;
  postalCode?: string;
}

export interface AsaasSubaccountResponse {
  id: string;
  name: string;
  email: string;
  walletId: string;
  apiKey?: string;
  accountNumber?: {
    agency: string;
    account: string;
    accountDigit: string;
  };
}
