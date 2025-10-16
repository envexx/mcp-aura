import axios from 'axios';

const AURA_BASE_URL = 'https://aura.adex.network/api';

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
    };
    
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }
    
    return headers;
  }

  async getPortfolio(address: string): Promise<Portfolio> {
    try {
      const response = await axios.get(
        `${this.baseURL}/portfolio/balances`,
        {
          params: { address },
          headers: this.getHeaders(),
        }
      );

      // Transform AURA API response to our Portfolio interface
      const data = response.data;
      
      return {
        address: data.address || address,
        totalValueUSD: data.totalValueUSD || '0',
        networks: data.networks || []
      };
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      // Return mock data for development
      return this.getMockPortfolio(address);
    }
  }

  async getStrategies(address: string): Promise<StrategyResponse> {
    try {
      const response = await axios.get(
        `${this.baseURL}/portfolio/strategies`,
        {
          params: { address },
          headers: this.getHeaders(),
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching strategies:', error);
      // Return mock data for development
      return this.getMockStrategies(address);
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

  // Mock data for development and testing
  private getMockPortfolio(address: string): Portfolio {
    return {
      address,
      totalValueUSD: '2450.75',
      networks: [
        {
          network: {
            name: 'Arbitrum One',
            chainId: '42161',
            rpcUrl: 'https://arb1.arbitrum.io/rpc',
            explorerUrl: 'https://arbiscan.io'
          },
          totalValueUSD: '1200.50',
          tokens: [
            {
              address: '0xA0b86a33E6441c8C5E7b4E9b4B6A8C5E7b4E9b4B',
              symbol: 'USDC',
              balance: '1200',
              balanceUSD: '1200.00',
              network: 'arbitrum',
              decimals: 6,
              logoURI: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png'
            }
          ]
        },
        {
          network: {
            name: 'Ethereum',
            chainId: '1',
            rpcUrl: 'https://mainnet.infura.io/v3/YOUR_KEY',
            explorerUrl: 'https://etherscan.io'
          },
          totalValueUSD: '1250.25',
          tokens: [
            {
              address: '0x0000000000000000000000000000000000000000',
              symbol: 'ETH',
              balance: '0.5',
              balanceUSD: '1250.25',
              network: 'ethereum',
              decimals: 18,
              logoURI: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png'
            }
          ]
        }
      ]
    };
  }

  private getMockStrategies(address: string): StrategyResponse {
    return {
      strategies: [
        {
          llm: {
            provider: 'openai',
            model: 'gpt-4'
          },
          response: [
            {
              name: 'Yield Optimization Strategy',
              risk: 'moderate',
              expectedYield: '8.5%',
              timeframe: '30 days',
              description: 'Optimize your portfolio for maximum yield while maintaining moderate risk exposure.',
              actions: [
                {
                  tokens: 'USDC, USDT',
                  description: 'Swap 50% of USDC to USDT on Uniswap V3 for better liquidity pool opportunities.',
                  platforms: [
                    {
                      name: 'Uniswap V3',
                      url: 'https://app.uniswap.org/#/swap'
                    }
                  ],
                  networks: ['arbitrum'],
                  operations: ['swap'],
                  apy: '3.5%',
                  risk: 'low',
                  estimatedGas: '0.002 ETH',
                  slippage: '0.5%'
                },
                {
                  tokens: 'USDC, ETH',
                  description: 'Provide liquidity to USDC/ETH pool on Uniswap V3 for earning fees.',
                  platforms: [
                    {
                      name: 'Uniswap V3',
                      url: 'https://app.uniswap.org/#/pool'
                    }
                  ],
                  networks: ['arbitrum'],
                  operations: ['stake', 'liquidity'],
                  apy: '12.3%',
                  risk: 'moderate',
                  estimatedGas: '0.005 ETH',
                  slippage: '1%'
                }
              ]
            },
            {
              name: 'Cross-Chain Arbitrage',
              risk: 'high',
              expectedYield: '15.2%',
              timeframe: '7 days',
              description: 'Take advantage of price differences across different chains.',
              actions: [
                {
                  tokens: 'ETH',
                  description: 'Bridge ETH from Ethereum to Arbitrum using Stargate for lower fees.',
                  platforms: [
                    {
                      name: 'Stargate',
                      url: 'https://stargate.finance'
                    }
                  ],
                  networks: ['ethereum', 'arbitrum'],
                  operations: ['bridge'],
                  apy: '0%',
                  risk: 'low',
                  estimatedGas: '0.01 ETH',
                  slippage: '0.1%'
                }
              ]
            }
          ]
        }
      ]
    };
  }
}

export const auraAPI = new AuraAPI(process.env.AURA_API_KEY);
