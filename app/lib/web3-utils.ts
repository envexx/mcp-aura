import { ethers, BigNumber } from 'ethers';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Interface } from '@ethersproject/abi';
import { AddressZero } from '@ethersproject/constants';
import { formatEther, formatUnits, parseUnits } from '@ethersproject/units';

export interface TransactionRequest {
  to: string;
  value?: string;
  data?: string;
  gasLimit?: string;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
}

export interface SwapParams {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOutMin: string;
  recipient: string;
  deadline: number;
}

export interface BridgeParams {
  token: string;
  amount: string;
  destinationChain: string;
  recipient: string;
}

export interface TransferParams {
  token: string;
  amount: string;
  recipient: string;
}

export interface FeeEstimate {
  gasLimit: string;
  gasPrice: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  totalFeeETH: string;
  totalFeeUSD: string;
}

export class Web3Utils {
  private provider: JsonRpcProvider;
  private chainId: number;

  constructor(rpcUrl: string, chainId: number) {
    this.provider = new JsonRpcProvider(rpcUrl);
    this.chainId = chainId;
  }

  async estimateGas(txRequest: TransactionRequest): Promise<FeeEstimate> {
    try {
      const gasLimit = await this.provider.estimateGas({
        to: txRequest.to,
        value: txRequest.value ? BigNumber.from(txRequest.value) : undefined,
        data: txRequest.data ?? '0x'
      });

      const feeData = await this.provider.getFeeData();
      const gasPrice = feeData.gasPrice ?? parseUnits('20', 'gwei');
      
      const totalFeeWei = gasLimit.mul(gasPrice);
      const totalFeeETH = formatEther(totalFeeWei);
      
      // Mock ETH price for USD calculation
      const ethPriceUSD = 2500; // This should come from a price oracle
      const totalFeeUSD = (parseFloat(totalFeeETH) * ethPriceUSD).toFixed(2);

      return {
        gasLimit: gasLimit.toString(),
        gasPrice: gasPrice.toString(),
        maxFeePerGas: feeData.maxFeePerGas?.toString(),
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString(),
        totalFeeETH,
        totalFeeUSD
      };
    } catch (error) {
      console.error('Error estimating gas:', error);
      throw new Error('Failed to estimate gas fees');
    }
  }

  async buildSwapTransaction(params: SwapParams): Promise<TransactionRequest> {
    // This is a simplified example for Uniswap V3
    // In production, you would use the actual Uniswap SDK
    const uniswapV3RouterAddress = '0xE592427A0AEce92De3Edee1F18E0157C05861564';
    
    // Mock swap data - in production, use Uniswap SDK to encode this properly
    return {
      to: uniswapV3RouterAddress,
      data: '0x', // Placeholder: actual calldata should be generated via Uniswap SDK
      value: params.tokenIn === AddressZero ? parseUnits(params.amountIn, 18).toString() : '0'
    };
  }

  async buildBridgeTransaction(params: BridgeParams): Promise<TransactionRequest> {
    // This is a simplified example for Stargate bridge
    // In production, you would use the actual Stargate SDK
    const stargateRouterAddress = '0x53Bf833A5d6c4ddA888F69c22C88C9f356a41614';
    
    // Mock bridge data
    return {
      to: stargateRouterAddress,
      data: '0x',
      value: '0'
    };
  }

  async buildTransferTransaction(params: TransferParams): Promise<TransactionRequest> {
    if (params.token === AddressZero) {
      // ETH transfer
      return {
        to: params.recipient,
        value: parseUnits(params.amount, 18).toString()
      };
    } else {
      // ERC20 transfer
      const erc20Interface = new Interface([
        'function transfer(address to, uint256 amount) returns (bool)'
      ]);
      
      const transferData = erc20Interface.encodeFunctionData('transfer', [
        params.recipient,
        parseUnits(params.amount, 18)
      ]);

      return {
        to: params.token,
        data: transferData,
        value: '0'
      };
    }
  }

  async getTokenBalance(tokenAddress: string, walletAddress: string): Promise<string> {
    if (tokenAddress === AddressZero) {
      // ETH balance
      const balance = await this.provider.getBalance(walletAddress);
      return formatEther(balance);
    } else {
      // ERC20 balance
      const erc20Interface = new Interface([
        'function balanceOf(address owner) view returns (uint256)'
      ]);
      
      const contract = new ethers.Contract(tokenAddress, erc20Interface, this.provider);
      const balance = await contract.balanceOf(walletAddress);
      return formatUnits(balance, 18); // Assuming 18 decimals
    }
  }

  async getTransactionStatus(txHash: string): Promise<{
    status: 'pending' | 'success' | 'failed';
    blockNumber?: number;
    gasUsed?: string;
    effectiveGasPrice?: string;
  }> {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      
      if (!receipt) {
        return { status: 'pending' };
      }

      return {
        status: receipt.status === 1 ? 'success' : 'failed',
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        effectiveGasPrice: receipt.effectiveGasPrice?.toString()
      };
    } catch (error) {
      console.error('Error getting transaction status:', error);
      return { status: 'failed' };
    }
  }

  generateWalletConnectUri(params: {
    operation: string;
    txData: TransactionRequest;
    callbackUrl: string;
  }): string {
    // This is a simplified WalletConnect URI generation
    // In production, use the official WalletConnect SDK
    const wcParams = {
      topic: `mcp-aura-${Date.now()}`,
      version: '2',
      bridge: 'https://bridge.walletconnect.org',
      key: ethers.utils.hexlify(ethers.utils.randomBytes(32)),
      chainId: this.chainId,
      operation: params.operation,
      txData: params.txData,
      callback: params.callbackUrl
    };

    const encodedParams = encodeURIComponent(JSON.stringify(wcParams));
    return `wc:${wcParams.topic}@${wcParams.version}?relay-protocol=irn&symKey=${wcParams.key}&data=${encodedParams}`;
  }
}

// Network configurations
export const NETWORKS = {
  ethereum: {
    chainId: 1,
    name: 'Ethereum',
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
    explorerUrl: 'https://etherscan.io'
  },
  arbitrum: {
    chainId: 42161,
    name: 'Arbitrum One',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    explorerUrl: 'https://arbiscan.io'
  },
  polygon: {
    chainId: 137,
    name: 'Polygon',
    rpcUrl: 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com'
  }
};

export function getWeb3Utils(network: keyof typeof NETWORKS): Web3Utils {
  const config = NETWORKS[network];
  return new Web3Utils(config.rpcUrl, config.chainId);
}
