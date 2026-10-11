import { 
  ASAAS_CONFIG, 
  AsaasCustomerInput, 
  AsaasPixChargeInput, 
  AsaasPixQrCodeResponse,
  AsaasSubscriptionInput 
} from './config';

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

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

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
      // Modo Mock de Fallback para testes locais em desenvolvimento
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[Asaas Client Mock] Executando mock local para ${endpoint}`);
        return (await AsaasClient.mockResponse(endpoint, options)) as T;
      }
      throw err;
    }
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
    return this.request('/subscriptions', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  /**
   * Mock inteligente para testes de desenvolvimento offline
   */
  private static async mockResponse(endpoint: string, options: RequestInit): Promise<any> {
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
        const QRCode = require('qrcode');
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
    if (endpoint === '/subscriptions') {
      return {
        id: `sub_${Math.random().toString(36).substring(7)}`,
        status: 'ACTIVE',
        value: 89.90,
        cycle: 'MONTHLY',
      };
    }
    return { success: true };
  }
}
