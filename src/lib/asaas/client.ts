import { 
  ASAAS_CONFIG, 
  AsaasCustomerInput, 
  AsaasPixChargeInput, 
  AsaasPixQrCodeResponse,
  AsaasSubscriptionInput,
  AsaasSubaccountInput,
  AsaasSubaccountResponse
} from './config';
import QRCode from 'qrcode';

/**
 * Cliente HTTP para a API v3 do Asaas (Sandbox e Produção)
 */
export class AsaasClient {
  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${ASAAS_CONFIG.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'access_token': ASAAS_CONFIG.apiKey,
      ...(options.headers || {}),
    };

    const maxRetries = 3;
    let lastError: any = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers,
        });

        // Se for erro transitório ou rate limit e ainda houver tentativas
        if ((response.status === 429 || (response.status >= 500 && response.status <= 504)) && attempt < maxRetries) {
          const retryAfter = response.headers.get('Retry-After');
          let delayMs = 500 * Math.pow(2, attempt) + Math.random() * 200;
          if (retryAfter) {
            const seconds = Number(retryAfter);
            if (Number.isFinite(seconds) && seconds > 0) {
              delayMs = seconds * 1000;
            }
          }
          console.warn(`[Asaas API Throttling/5xx] Status ${response.status}. Tentativa ${attempt + 1}/${maxRetries}. Aguardando ${Math.round(delayMs)}ms...`);
          await new Promise((r) => setTimeout(r, delayMs));
          continue;
        }

        const data = await response.json();

        if (!response.ok) {
          console.error('Erro na resposta da API Asaas:', data);
          const errorMessage = data?.errors?.[0]?.description || 'Erro ao processar requisição no Asaas.';
          const errorCode = data?.errors?.[0]?.code;
          
          // Em desenvolvimento local, se a chave do Sandbox der erro de autenticação, ativa o simulador local
          if (
            process.env.NODE_ENV !== 'production' && 
            (response.status === 401 || errorCode === 'invalid_access_token' || errorCode === 'invalid_access_token_format')
          ) {
            console.warn(`[Asaas Client Fallback] Autenticação rejeitada (${errorCode || response.status}). Ativando simulador local para ${endpoint}`);
            return (await AsaasClient.mockResponse(endpoint, options)) as T;
          }

          throw new Error(errorMessage);
        }

        return data as T;
      } catch (err: any) {
        lastError = err;
        if (attempt < maxRetries && (err.name === 'AbortError' || err.name === 'TypeError')) {
          const delayMs = 500 * Math.pow(2, attempt) + Math.random() * 200;
          await new Promise((r) => setTimeout(r, delayMs));
          continue;
        }

        // Modo Mock de Fallback para testes locais em desenvolvimento
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`[Asaas Client Mock] Executando mock local para ${endpoint}:`, err?.message || err);
          return (await AsaasClient.mockResponse(endpoint, options)) as T;
        }
        throw err;
      }
    }

    throw lastError || new Error(`Falha após ${maxRetries} tentativas na API Asaas.`);
  }

  /**
   * Cria ou busca um cliente pagador no Asaas
   */
  static async createCustomer(input: AsaasCustomerInput): Promise<{ id: string; name: string }> {
    return this.request<{ id: string; name: string }>('/customers', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  /**
   * Cria uma cobrança Pix com split automático
   */
  static async createPixChargeWithSplit(input: AsaasPixChargeInput): Promise<{
    id: string;
    netValue: number;
    value: number;
    status: string;
    invoiceUrl: string;
  }> {
    const today = new Date();
    const dueDate = input.dueDate || today.toISOString().split('T')[0];

    const payload: any = {
      customer: input.customerId,
      billingType: 'PIX',
      value: input.value,
      dueDate,
      description: input.description,
      externalReference: input.externalReference,
    };

    if (input.split && input.split.length > 0) {
      payload.split = input.split;
    }

    return this.request('/payments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Obtém o QR Code e o código copia-e-cola de uma cobrança Pix
   */
  static async getPixQrCode(paymentId: string): Promise<AsaasPixQrCodeResponse> {
    return this.request<AsaasPixQrCodeResponse>(`/payments/${paymentId}/pixQrCode`, {
      method: 'GET',
    });
  }

  /**
   * Cria uma assinatura recorrente no Asaas (Planos Pro Coach / Studio)
   */
  static async createSubscription(input: AsaasSubscriptionInput): Promise<{
    id: string;
    status: string;
    value: number;
    cycle: string;
  }> {
    const payload: any = {
      customer: input.customerId,
      billingType: input.billingType,
      value: input.value,
      nextDueDate: input.nextDueDate,
      cycle: input.cycle,
      description: input.description,
    };

    if (input.creditCard) {
      payload.creditCard = input.creditCard;
    }
    if (input.creditCardHolderInfo) {
      payload.creditCardHolderInfo = input.creditCardHolderInfo;
    }

    return this.request('/subscriptions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Cancela uma assinatura recorrente no Asaas
   */
  static async cancelSubscription(subscriptionId: string): Promise<{ deleted: boolean; id: string }> {
    return this.request(`/subscriptions/${subscriptionId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Transfere valor via Pix para a chave do treinador
   */
  static async createPixTransfer(input: {
    value: number;
    pixAddressKey: string;
    pixAddressKeyType?: string;
    description?: string;
  }): Promise<{ id: string; status: string; value: number }> {
    return this.request('/transfers', {
      method: 'POST',
      body: JSON.stringify({
        value: input.value,
        pixAddressKey: input.pixAddressKey,
        pixAddressKeyType: input.pixAddressKeyType,
        description: input.description || 'Saque de Rendimentos - ArenaFitPro',
        operationType: 'PIX',
      }),
    });
  }

  /**
   * Cria uma subconta no Asaas para o profissional (necessária para receber Split)
   */
  static async createSubaccount(input: AsaasSubaccountInput): Promise<AsaasSubaccountResponse> {
    const payload: any = {
      name: input.name,
      email: input.email,
      cpfCnpj: input.cpfCnpj.replace(/\D/g, ''),
      incomeValue: input.incomeValue || 5000,
      phone: input.phone,
      mobilePhone: input.mobilePhone || input.phone,
    };

    if (input.birthDate) {
      payload.birthDate = input.birthDate;
    }
    if (input.companyType) {
      payload.companyType = input.companyType;
    }
    if (input.address) {
      payload.address = input.address;
      payload.addressNumber = input.addressNumber || 'S/N';
      payload.province = input.province || 'Centro';
      payload.postalCode = input.postalCode?.replace(/\D/g, '');
    }

    return this.request<AsaasSubaccountResponse>('/accounts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Lista as cobranças geradas por uma assinatura
   */
  static async getSubscriptionPayments(subscriptionId: string): Promise<{
    data: Array<{
      id: string;
      value: number;
      netValue: number;
      status: string;
      billingType: string;
      dueDate: string;
      invoiceUrl?: string;
    }>;
  }> {
    return this.request(`/subscriptions/${subscriptionId}/payments`, {
      method: 'GET',
    });
  }

  /**
   * Valida e consulta uma chave Pix no DICT do Banco Central através do Asaas
   */
  static async validatePixAddressKey(pixKey: string): Promise<{
    status: string;
    key: string;
    type?: string;
    account?: {
      bank?: { name: string; ispb?: string };
      owner?: { name: string; cpfCnpj?: string };
    };
  }> {
    return this.request(`/pix/addressKeys/${encodeURIComponent(pixKey)}`, {
      method: 'GET',
    });
  }

  /**
   * Mock inteligente para testes de desenvolvimento offline
   */
  private static async mockResponse(endpoint: string, options: RequestInit): Promise<any> {
    if (endpoint.includes('/pix/addressKeys/')) {
      const rawKey = decodeURIComponent(endpoint.split('/pix/addressKeys/')[1] || '');
      return {
        status: 'ACTIVE',
        key: rawKey,
        account: {
          bank: { name: 'Banco do Brasil / Nu / Inter (Validado)', ispb: '00000000' },
          owner: { name: 'Titular Confirmado', cpfCnpj: '***.***.***-**' },
        },
      };
    }
    if (endpoint === '/customers') {
      return { id: `cus_${Math.random().toString(36).substring(7)}`, name: 'Cliente Teste' };
    }
    if (endpoint === '/payments') {
      const mockId = `pay_${Math.random().toString(36).substring(7)}`;
      return {
        id: mockId,
        netValue: 95.0,
        value: 100.0,
        status: 'PENDING',
        invoiceUrl: `https://sandbox.asaas.com/i/${mockId}`,
      };
    }
    if (endpoint.includes('/pixQrCode')) {
      const payload = '00020101021226830014br.gov.bcb.pix2561pix-sandbox.asaas.com/qr/v2/mock5204000053039865802BR5920ArenaFitPro Plataforma6009Sao Paulo62070503***6304E7A1';
      let encodedImage = '';
      try {
        const url = await QRCode.toDataURL(payload, { margin: 1, width: 256 });
        encodedImage = url.replace(/^data:image\/png;base64,/, '');
      } catch (e) {
        console.warn('Erro ao gerar QR Code local:', e);
      }

      return {
        encodedImage,
        payload,
        expirationDate: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      };
    }
    if (endpoint === '/accounts') {
      const mockWallet = `wallet_${Math.random().toString(36).substring(2, 10)}`;
      return {
        id: `acc_${Math.random().toString(36).substring(7)}`,
        name: 'Treinador Parceiro',
        email: 'treinador@arenafit.pro',
        walletId: mockWallet,
        apiKey: `$aact_${Math.random().toString(36).substring(2, 15)}`,
      };
    }
    if (endpoint.includes('/subscriptions') && endpoint.includes('/payments')) {
      const mockPayId = `pay_${Math.random().toString(36).substring(7)}`;
      return {
        data: [
          {
            id: mockPayId,
            value: 89.90,
            netValue: 87.90,
            status: 'PENDING',
            billingType: 'PIX',
            dueDate: new Date().toISOString().split('T')[0],
            invoiceUrl: `https://sandbox.asaas.com/i/${mockPayId}`,
          },
        ],
      };
    }
    return { success: true };
  }
}
