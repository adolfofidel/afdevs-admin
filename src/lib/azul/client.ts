/**
 * Azul Payment Gateway Client for Dominican Republic
 * https://dev.azul.com.do
 *
 * This client handles payment processing through Azul's Webservices API
 */

export interface AzulConfig {
  merchantId: string      // Store/Merchant ID provided by Azul
  auth1: string           // Authentication key 1
  auth2: string           // Authentication key 2
  channel: string         // Channel (EC for e-commerce)
  environment: 'sandbox' | 'production'
}

export interface AzulSaleRequest {
  cardNumber: string
  expiration: string      // Format: YYYYMM
  cvc: string
  amount: number          // Amount in cents (no decimals)
  itbis: number           // Tax amount in cents
  orderNumber?: string
  customOrderId?: string
  saveToDataVault?: boolean
  dataVaultToken?: string // Use existing token instead of card
}

export interface AzulRecurringRequest {
  cardNumber: string
  expiration: string
  cvc: string
  amount: number
  itbis: number
  frequency: 'daily' | 'weekly' | 'monthly'
  startDate: string       // Format: YYYYMMDD
  endDate?: string        // Format: YYYYMMDD (optional)
  customOrderId?: string
}

export interface AzulTokenRequest {
  cardNumber: string
  expiration: string
  cvc: string
  action: 'create' | 'delete'
  dataVaultToken?: string // Required for delete action
}

export interface AzulResponse {
  IsoCode: string
  ResponseMessage: string
  AuthorizationCode?: string
  AzulOrderId?: string
  DateTime?: string
  RRN?: string
  CustomOrderId?: string
  DataVaultToken?: string
  DataVaultExpiration?: string
  DataVaultBrand?: string
  ErrorDescription?: string
  Ticket?: string
  LotNumber?: string
  // 3DS fields
  ThreeDSMethod?: {
    MethodForm: string
  }
  ThreeDSChallenge?: {
    CReq: string
    RedirectPostUrl: string
    MD?: string
    PaReq?: string
  }
}

const ENDPOINTS = {
  sandbox: {
    sale: 'https://pruebas.azul.com.do/WebServices/JSON/default.aspx',
    recurring: 'https://pruebas.azul.com.do/WebServices/JSON/default.aspx?recurringsubscriptioncreate',
    dataVault: 'https://pruebas.azul.com.do/WebServices/JSON/default.aspx'
  },
  production: {
    sale: 'https://pagos.azul.com.do/WebServices/JSON/default.aspx',
    recurring: 'https://pagos.azul.com.do/WebServices/JSON/default.aspx?recurringsubscriptioncreate',
    dataVault: 'https://pagos.azul.com.do/WebServices/JSON/default.aspx'
  }
}

export class AzulClient {
  private config: AzulConfig

  constructor(config: AzulConfig) {
    this.config = config
  }

  private getEndpoints() {
    return ENDPOINTS[this.config.environment]
  }

  private async makeRequest(url: string, body: Record<string, any>): Promise<AzulResponse> {
    const requestBody = {
      Channel: this.config.channel,
      Store: this.config.merchantId,
      ...body
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Auth1': this.config.auth1,
        'Auth2': this.config.auth2
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      throw new Error(`Azul API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Process a one-time sale/payment
   */
  async processSale(request: AzulSaleRequest): Promise<AzulResponse> {
    const endpoints = this.getEndpoints()

    const body: Record<string, any> = {
      CardNumber: request.cardNumber,
      Expiration: request.expiration,
      CVC: request.cvc,
      PosInputMode: 'E-Commerce',
      TrxType: 'Sale',
      Amount: request.amount.toString(),
      Itbis: request.itbis.toString(),
      OrderNumber: request.orderNumber || '',
      CustomOrderId: request.customOrderId || '',
      SaveToDataVault: request.saveToDataVault ? '1' : '0',
      DataVaultToken: request.dataVaultToken || ''
    }

    return this.makeRequest(endpoints.sale, body)
  }

  /**
   * Process a payment using a saved token (DataVault)
   */
  async processTokenSale(
    dataVaultToken: string,
    amount: number,
    itbis: number,
    customOrderId?: string
  ): Promise<AzulResponse> {
    const endpoints = this.getEndpoints()

    const body = {
      DataVaultToken: dataVaultToken,
      PosInputMode: 'E-Commerce',
      TrxType: 'Sale',
      Amount: amount.toString(),
      Itbis: itbis.toString(),
      CustomOrderId: customOrderId || ''
    }

    return this.makeRequest(endpoints.sale, body)
  }

  /**
   * Create a recurring subscription
   */
  async createRecurringSubscription(request: AzulRecurringRequest): Promise<AzulResponse> {
    const endpoints = this.getEndpoints()

    // Calculate frequency fields based on type
    let frequencyFields: Record<string, string> = {}

    switch (request.frequency) {
      case 'daily':
        frequencyFields = {
          ScheduleType: 'D',
          TotalRecurrence: '0' // 0 = unlimited
        }
        break
      case 'weekly':
        frequencyFields = {
          ScheduleType: 'W',
          DayOfWeek: new Date(request.startDate).getDay().toString(),
          TotalRecurrence: '0'
        }
        break
      case 'monthly':
        frequencyFields = {
          ScheduleType: 'M',
          DayOfMonth: new Date(request.startDate).getDate().toString(),
          TotalRecurrence: '0'
        }
        break
    }

    const body = {
      CardNumber: request.cardNumber,
      Expiration: request.expiration,
      CVC: request.cvc,
      PosInputMode: 'E-Commerce',
      Amount: request.amount.toString(),
      Itbis: request.itbis.toString(),
      StartDate: request.startDate,
      EndDate: request.endDate || '',
      CustomOrderId: request.customOrderId || '',
      ...frequencyFields
    }

    return this.makeRequest(endpoints.recurring, body)
  }

  /**
   * Create a DataVault token (save card for future use)
   */
  async createToken(
    cardNumber: string,
    expiration: string,
    cvc: string
  ): Promise<AzulResponse> {
    const endpoints = this.getEndpoints()

    const body = {
      CardNumber: cardNumber,
      Expiration: expiration,
      CVC: cvc,
      TrxType: 'CREATE'
    }

    return this.makeRequest(`${endpoints.dataVault}?ProcessDataVault`, body)
  }

  /**
   * Delete a DataVault token
   */
  async deleteToken(dataVaultToken: string): Promise<AzulResponse> {
    const endpoints = this.getEndpoints()

    const body = {
      DataVaultToken: dataVaultToken,
      TrxType: 'DELETE'
    }

    return this.makeRequest(`${endpoints.dataVault}?ProcessDataVault`, body)
  }

  /**
   * Verify a transaction by AzulOrderId
   */
  async verifyTransaction(azulOrderId: string): Promise<AzulResponse> {
    const endpoints = this.getEndpoints()

    const body = {
      AzulOrderId: azulOrderId
    }

    return this.makeRequest(`${endpoints.sale}?VerifyPayment`, body)
  }

  /**
   * Check if response indicates success
   */
  static isApproved(response: AzulResponse): boolean {
    return response.IsoCode === '00'
  }

  /**
   * Check if 3DS authentication is required
   */
  static requires3DS(response: AzulResponse): boolean {
    return response.IsoCode === '3D' || response.IsoCode === '3D2METHOD'
  }

  /**
   * Get human-readable error message
   */
  static getErrorMessage(response: AzulResponse): string {
    if (response.ErrorDescription) {
      return response.ErrorDescription
    }

    const messages: Record<string, string> = {
      '00': 'Transacción aprobada',
      '01': 'Referir a emisor',
      '02': 'Referir a emisor',
      '03': 'Comercio inválido',
      '04': 'Tarjeta retenida',
      '05': 'Transacción rechazada',
      '12': 'Transacción inválida',
      '13': 'Monto inválido',
      '14': 'Tarjeta inválida',
      '51': 'Fondos insuficientes',
      '54': 'Tarjeta expirada',
      '55': 'PIN incorrecto',
      '57': 'Transacción no permitida',
      '58': 'Transacción no permitida para terminal',
      '61': 'Excede límite de retiro',
      '62': 'Tarjeta restringida',
      '65': 'Excede límite de frecuencia',
      '75': 'Excede intentos de PIN',
      '78': 'Tarjeta no activada',
      '91': 'Emisor no disponible',
      '96': 'Error del sistema',
      '99': 'Transacción declinada'
    }

    return messages[response.IsoCode] || response.ResponseMessage || 'Error desconocido'
  }
}

/**
 * Create Azul client from environment variables
 */
export function createAzulClient(): AzulClient {
  const config: AzulConfig = {
    merchantId: process.env.AZUL_MERCHANT_ID!,
    auth1: process.env.AZUL_AUTH1!,
    auth2: process.env.AZUL_AUTH2!,
    channel: process.env.AZUL_CHANNEL || 'EC',
    environment: (process.env.AZUL_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox'
  }

  if (!config.merchantId || !config.auth1 || !config.auth2) {
    throw new Error('Missing Azul configuration. Please set AZUL_MERCHANT_ID, AZUL_AUTH1, and AZUL_AUTH2 environment variables.')
  }

  return new AzulClient(config)
}
