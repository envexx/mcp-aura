import axios, { AxiosResponse } from 'axios';

// AURA API endpoints - Updated with correct base URL
const AURA_ENDPOINTS = [
  'https://aura.adex.network/api',
  'https://aura.adex.network/v1',
  'https://aura.adex.network'
];

const AURA_BASE_URL = AURA_ENDPOINTS[0]; // Default to first endpoint

export interface Token {
  address: string;
  symbol: string;
  balance: string;
  balanceUSD: string;
  network: string;
  decimals?: number;
  logoURI?: string;
}

export interface Network {
  name: string;
  chainId: string;
  rpcUrl?: string;
  explorerUrl?: string;
  platformId?: string;
  iconUrls?: string[];
}

export interface Portfolio {
  address: string;
  totalValueUSD: string;
  networks: Array<{
    network: Network;
    tokens: Token[];
    totalValueUSD: string;
  }>;
}

export interface ActionStep {
  tokens: string;
  description: string;
  platforms: Array<{
    name: string;
    url: string;
  }>;
  networks: string[];
  operations: string[];
  apy?: string;
  risk?: string;
  estimatedGas?: string;
  slippage?: string;
}

export interface Strategy {
  name: string;
  risk: 'low' | 'moderate' | 'high';
  expectedYield: string;
  timeframe: string;
  actions: ActionStep[];
  description: string;
}

export interface StrategyResponse {
  strategies: Array<{
    llm: {
      provider: string;
      model: string;
    };
    response: Strategy[];
  }>;
}

export class AuraAPI {
  private baseURL: string;
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.baseURL = AURA_BASE_URL;
    this.apiKey = apiKey;
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'ENVXX-MCP-AURA/1.0.0',
      'Accept': 'application/json'
    };
    
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }
    
    return headers;
  }

  // Try multiple endpoints until one works
  private async tryMultipleEndpoints(path: string, params: any = {}): Promise<AxiosResponse> {
    let lastError: any;
    let lastResponse: AxiosResponse | null = null;
    
    for (const endpoint of AURA_ENDPOINTS) {
      try {
        console.log(`Trying endpoint: ${endpoint}${path}`);
        const response = await axios.get(`${endpoint}${path}`, {
          params,
          headers: this.getHeaders(),
          timeout: 10000,
          validateStatus: () => true
        });

        if (response.status >= 200 && response.status < 400) {
          console.log(`Success with endpoint: ${endpoint} (Status: ${response.status})`);
          return response;
        }

        console.warn(`Endpoint responded with status ${response.status}: ${endpoint}${path}`);
        lastResponse = response;
        continue;

      } catch (error: any) {
        console.log(`Failed endpoint: ${endpoint} - ${error.message}`);
        lastError = error;
        continue;
      }
    }

    if (lastResponse) {
      const message = typeof lastResponse.data === 'string'
        ? lastResponse.data
        : JSON.stringify(lastResponse.data);
      throw new Error(`AURA API returned ${lastResponse.status}: ${message}`);
    }

    throw lastError ?? new Error('All AURA endpoints failed');
  }

  private transformPortfolioResponse(data: any, address: string): Portfolio {
    const portfolioEntries = Array.isArray(data?.portfolio) ? data.portfolio : [];

    const networks = portfolioEntries.map((entry: any): Portfolio['networks'][number] => {
      const tokens: Token[] = Array.isArray(entry?.tokens)
        ? entry.tokens.map((token: any) => {
            const balanceValue = Number(token?.balance ?? token?.amount ?? 0);
            const balanceUSDValue = Number(token?.balanceUSD ?? token?.balance_usd ?? 0);

            return {
              address: token?.address ?? '',
              symbol: token?.symbol ?? '',
              balance: balanceValue.toString(),
              balanceUSD: balanceUSDValue.toFixed(2),
              network:
                entry?.network?.platformId ??
                entry?.network?.name?.toLowerCase() ??
                '',
              decimals: token?.decimals,
              logoURI: token?.logo ?? token?.logoURI,
            };
          })
        : [];

      const totalValue = tokens.reduce((sum: number, token: Token) => {
        return sum + Number(token.balanceUSD ?? '0');
      }, 0);

      return {
        network: {
          name: entry?.network?.name ?? 'Unknown Network',
          chainId: entry?.network?.chainId
            ? String(entry.network.chainId)
            : '',
          rpcUrl: entry?.network?.rpcUrl,
          explorerUrl: entry?.network?.explorerUrl,
          platformId: entry?.network?.platformId,
          iconUrls: entry?.network?.iconUrls,
        },
        tokens,
        totalValueUSD: totalValue.toFixed(2),
      };
    });

    const totalValueUSDNumeric = networks.reduce(
      (sum: number, item: Portfolio['networks'][number]) =>
        sum + Number(item.totalValueUSD ?? '0'),
      0
    );

    return {
      address: data?.address ?? address,
      totalValueUSD: totalValueUSDNumeric.toFixed(2),
      networks,
    };
  }

  async getPortfolio(address: string): Promise<Portfolio> {
    // Validate address format
    if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
      throw new Error('Invalid wallet address format');
    }

    console.log(`Fetching portfolio for address: ${address}`);

    try {
      // Try multiple endpoints
      const params: Record<string, string> = { address };
      if (this.apiKey) {
        params.apiKey = this.apiKey;
      }

      const response = await this.tryMultipleEndpoints('/portfolio/balances', params);

      // Handle different response formats
      if (response.status === 404) {
        throw new Error('Portfolio not found for this address');
      }

      // Transform AURA API response to our Portfolio interface
      return this.transformPortfolioResponse(response.data, address);
      
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Unable to fetch portfolio data from AURA API';
      throw new Error(message);
    }
  }

  async getStrategies(address: string): Promise<StrategyResponse> {
    // Validate address format
    if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
      throw new Error('Invalid wallet address format');
    }

    console.log(`Fetching strategies for address: ${address}`);

    try {
      // Try multiple endpoints
      const params: Record<string, string> = { address };
      if (this.apiKey) {
        params.apiKey = this.apiKey;
      }

      const response = await this.tryMultipleEndpoints('/portfolio/strategies', params);

      // Handle different response formats
      if (response.status === 404) {
        throw new Error('Strategies not found for this address');
      }

      return response.data;
      
    } catch (error: any) {
      const rawMessage = error?.response?.data?.message || error?.message || 'Unable to fetch strategies from AURA API';
      const message = String(rawMessage);

      if (message.includes('AURA API returned 404') || message.includes('Cannot GET /portfolio/strategies')) {
        console.warn('AURA strategies endpoint is currently unavailable. Returning empty strategy list.');
        return {
          strategies: []
        };
      }

      throw new Error(message);
    }
  }

  async getTokenPrice(tokenAddress: string, network: string): Promise<number> {
    try {
      const response = await axios.get(
        `${this.baseURL}/tokens/price`,
        {
          params: { 
            token: tokenAddress,
            network 
          },
          headers: this.getHeaders(),
        }
      );

      return response.data.price || 0;
    } catch (error) {
      console.error('Error fetching token price:', error);
      return 0;
    }
  }

  async getGasEstimate(
    network: string,
    operation: string,
    params: Record<string, any>
  ): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseURL}/gas/estimate`,
        {
          network,
          operation,
          ...params
        },
        {
          headers: this.getHeaders(),
        }
      );

      return response.data.gasEstimate || '0';
    } catch (error) {
      console.error('Error estimating gas:', error);
      return '0';
    }
  }

}

export const auraAPI = new AuraAPI(process.env.AURA_API_KEY);
