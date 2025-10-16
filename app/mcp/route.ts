import { baseURL } from "@/baseUrl";
import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { auraAPI } from "@/app/lib/aura-api";

const getAppsSdkCompatibleHtml = async (baseUrl: string, path: string) => {
  const result = await fetch(`${baseUrl}${path}`);
  return await result.text();
};

type ContentWidget = {
  id: string;
  title: string;
  templateUri: string;
  invoking: string;
  invoked: string;
  html: string;
  description: string;
  widgetDomain: string;
};

function widgetMeta(widget: ContentWidget) {
  return {
    "openai/outputTemplate": widget.templateUri,
    "openai/toolInvocation/invoking": widget.invoking,
    "openai/toolInvocation/invoked": widget.invoked,
    "openai/widgetAccessible": false,
    "openai/resultCanProduceWidget": true,
  } as const;
}

const handler = createMcpHandler(async (server) => {
  // Portfolio Widget
  const portfolioWidget: ContentWidget = {
    id: "portfolio_analysis",
    title: "Portfolio Analysis",
    templateUri: "ui://widget/portfolio-template.html",
    invoking: "Analyzing portfolio...",
    invoked: "Portfolio loaded",
    html: await getAppsSdkCompatibleHtml(baseURL, "/portfolio"),
    description: "Displays comprehensive portfolio analysis with DeFi opportunities",
    widgetDomain: "https://aura.adex.network",
  };

  // Strategy Widget
  const strategyWidget: ContentWidget = {
    id: "strategy_recommendations",
    title: "DeFi Strategy Recommendations",
    templateUri: "ui://widget/strategy-template.html",
    invoking: "Generating strategies...",
    invoked: "Strategies loaded",
    html: await getAppsSdkCompatibleHtml(baseURL, "/strategy"),
    description: "AI-powered DeFi strategy recommendations with actionable steps",
    widgetDomain: "https://aura.adex.network",
  };

  // Register Portfolio Resource
  server.registerResource(
    "portfolio-widget",
    portfolioWidget.templateUri,
    {
      title: portfolioWidget.title,
      description: portfolioWidget.description,
      mimeType: "text/html+skybridge",
      _meta: {
        "openai/widgetDescription": portfolioWidget.description,
        "openai/widgetPrefersBorder": true,
      },
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "text/html+skybridge",
          text: `<html>${portfolioWidget.html}</html>`,
          _meta: {
            "openai/widgetDescription": portfolioWidget.description,
            "openai/widgetPrefersBorder": true,
            "openai/widgetDomain": portfolioWidget.widgetDomain,
          },
        },
      ],
    })
  );

  // Action Status Tool
  server.registerTool(
    "get_action_status",
    {
      title: "Get Action Status",
      description: "Retrieve the latest status of a prepared DeFi action, including transaction hash and history.",
      inputSchema: {
        actionId: z.string().describe("Action identifier returned by execute_action"),
      },
    },
    async ({ actionId }: { actionId: string }) => {
      (global as any).actionStore = (global as any).actionStore || new Map();
      const actionStore: Map<string, any> = (global as any).actionStore;
      const actionData = actionStore.get(actionId);

      if (!actionData) {
        return {
          content: [
            {
              type: "text",
              text: `No action found for ID ${actionId}. It may have expired or never existed.`,
            },
          ],
          isError: true,
        };
      }

      const statusSummary = [`Status: ${actionData.status}`, `Updated: ${actionData.updatedAt}`];

      if (actionData.txHash) {
        statusSummary.push(`Transaction Hash: ${actionData.txHash}`);
      }

      if (actionData.error) {
        statusSummary.push(`Error: ${actionData.error}`);
      }

      return {
        content: [
          {
            type: "text",
            text: statusSummary.join("\n"),
          },
        ],
        structuredContent: {
          actionId,
          status: actionData.status,
          txHash: actionData.txHash,
          error: actionData.error ?? null,
          metadata: actionData.statusMetadata ?? null,
          history: actionData.history ?? [],
          updatedAt: actionData.updatedAt,
        },
      };
    }
  );

  // Register Strategy Resource
  server.registerResource(
    "strategy-widget",
    strategyWidget.templateUri,
    {
      title: strategyWidget.title,
      description: strategyWidget.description,
      mimeType: "text/html+skybridge",
      _meta: {
        "openai/widgetDescription": strategyWidget.description,
        "openai/widgetPrefersBorder": true,
      },
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "text/html+skybridge",
          text: `<html>${strategyWidget.html}</html>`,
          _meta: {
            "openai/widgetDescription": strategyWidget.description,
            "openai/widgetPrefersBorder": true,
            "openai/widgetDomain": strategyWidget.widgetDomain,
          },
        },
      ],
    })
  );

  // Portfolio Analysis Tool
  server.registerTool(
    "get_portfolio",
    {
      title: "Get Portfolio Analysis",
      description: "Analyze a wallet address to get portfolio breakdown, token balances, and DeFi positions across multiple chains",
      inputSchema: {
        address: z.string().regex(/^0x[a-fA-F0-9]{40}$/).describe("Ethereum wallet address to analyze"),
      },
      _meta: widgetMeta(portfolioWidget),
    },
    async ({ address }) => {
      try {
        const portfolio = await auraAPI.getPortfolio(address);
        
        return {
          content: [
            {
              type: "text",
              text: `Portfolio Analysis for ${address}:\n\nTotal Value: $${portfolio.totalValueUSD}\n\nAssets across ${portfolio.networks.length} networks:\n${portfolio.networks.map(n => `- ${n.network.name}: $${n.totalValueUSD}`).join('\n')}`,
            },
          ],
          structuredContent: {
            address,
            portfolio,
            timestamp: new Date().toISOString(),
          },
          _meta: widgetMeta(portfolioWidget),
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error analyzing portfolio: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );

  // Strategy Recommendations Tool
  server.registerTool(
    "get_strategy",
    {
      title: "Get DeFi Strategy Recommendations",
      description: "Get AI-powered DeFi strategy recommendations including yield farming, staking, and cross-chain opportunities",
      inputSchema: {
        address: z.string().regex(/^0x[a-fA-F0-9]{40}$/).describe("Wallet address to analyze for strategies"),
        riskLevel: z.enum(["low", "moderate", "high"]).optional().describe("Risk tolerance level"),
        timeframe: z.enum(["1d", "7d", "30d", "90d"]).optional().describe("Investment timeframe"),
      },
      _meta: widgetMeta(strategyWidget),
    },
    async ({ address, riskLevel, timeframe }) => {
      try {
        const strategies = await auraAPI.getStrategies(address);
        
        const filteredStrategies = riskLevel 
          ? strategies.strategies.map(s => ({
              ...s,
              response: s.response.filter(r => r.risk === riskLevel)
            }))
          : strategies.strategies;

        const strategyText = filteredStrategies.map(s => 
          s.response.map(r => 
            `Strategy: ${r.name}\nRisk: ${r.risk}\nExpected Yield: ${r.expectedYield}\n\nActions:\n${r.actions.map(a => `- ${a.description} (APY: ${a.apy})`).join('\n')}`
          ).join('\n\n')
        ).join('\n\n');

        return {
          content: [
            {
              type: "text",
              text: `DeFi Strategy Recommendations for ${address}:\n\n${strategyText}`,
            },
          ],
          structuredContent: {
            address,
            strategies: filteredStrategies,
            filters: { riskLevel, timeframe },
            timestamp: new Date().toISOString(),
          },
          _meta: widgetMeta(strategyWidget),
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting strategies: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );

  // Execute Action Tool
  server.registerTool(
    "execute_action",
    {
      title: "Execute DeFi Action",
      description: "Execute DeFi actions like swap, stake, or bridge tokens. Returns transaction details and wallet signature requirements.",
      inputSchema: {
        fromAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/).describe("Wallet address executing the action"),
        operation: z.enum(["swap", "stake", "bridge"]).describe("Type of DeFi operation"),
        platform: z.string().describe("DeFi platform (e.g., Uniswap, Aave, Stargate)"),
        tokenIn: z.string().describe("Input token symbol or address"),
        tokenOut: z.string().describe("Output token symbol or address"),
        amountIn: z.string().describe("Amount to swap/stake/bridge"),
        network: z.enum(["ethereum", "arbitrum", "polygon"]).describe("Blockchain network"),
        slippage: z.string().optional().describe("Slippage tolerance (default: 0.5%)"),
      },
    },
    async ({ fromAddress, operation, platform, tokenIn, tokenOut, amountIn, network, slippage }) => {
      try {
        const response = await fetch(`${baseURL}/api/mcp/action`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fromAddress,
            operation,
            platform,
            tokenIn,
            tokenOut,
            amountIn,
            network,
            slippage: slippage || '0.5'
          })
        });

        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to prepare action');
        }

        const { data } = result;
        
        return {
          content: [
            {
              type: "text",
              text: `Action prepared: ${operation} ${amountIn} ${tokenIn} for ${tokenOut} on ${platform}\n\nEstimated Gas: ${data.estimatedFees.totalFeeETH} ETH ($${data.estimatedFees.totalFeeUSD})\nRisk Level: ${data.metadata.riskLevel}\n\nNext: User needs to sign transaction in wallet.`,
            },
          ],
          structuredContent: {
            actionId: data.actionId,
            operation,
            platform,
            network,
            estimatedFees: data.estimatedFees,
            requiresSignature: true,
            timestamp: new Date().toISOString(),
          },
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error preparing action: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );

  // Transfer Tokens Tool
  server.registerTool(
    "transfer_tokens",
    {
      title: "Transfer Tokens",
      description: "Transfer tokens between wallets with fee estimation and balance validation",
      inputSchema: {
        fromAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/).describe("Sender wallet address"),
        toAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/).describe("Recipient wallet address"),
        token: z.string().describe("Token symbol or address to transfer"),
        amount: z.string().describe("Amount to transfer"),
        network: z.enum(["ethereum", "arbitrum", "polygon"]).describe("Blockchain network"),
        memo: z.string().optional().describe("Optional memo for the transfer"),
      },
    },
    async ({ fromAddress, toAddress, token, amount, network, memo }) => {
      try {
        const response = await fetch(`${baseURL}/api/mcp/transfer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fromAddress,
            toAddress,
            token,
            amount,
            network,
            memo
          })
        });

        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to prepare transfer');
        }

        const { data } = result;
        
        return {
          content: [
            {
              type: "text",
              text: `Transfer prepared: ${amount} ${token} from ${fromAddress} to ${toAddress}\n\nCurrent Balance: ${data.balanceCheck.currentBalance}\nAfter Transfer: ${data.balanceCheck.afterTransfer}\nEstimated Gas: ${data.estimatedFees.totalFeeETH} ETH ($${data.estimatedFees.totalFeeUSD})\n\nNext: User needs to sign transaction in wallet.`,
            },
          ],
          structuredContent: {
            transferId: data.transferId,
            fromAddress,
            toAddress,
            token,
            amount,
            network,
            estimatedFees: data.estimatedFees,
            balanceCheck: data.balanceCheck,
            requiresSignature: true,
            timestamp: new Date().toISOString(),
          },
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error preparing transfer: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );

  // Estimate Fees Tool
  server.registerTool(
    "estimate_fees",
    {
      title: "Estimate Transaction Fees",
      description: "Get real-time gas fee estimates for different types of transactions across networks",
      inputSchema: {
        network: z.enum(["ethereum", "arbitrum", "polygon"]).describe("Blockchain network"),
        operation: z.enum(["swap", "transfer", "stake", "bridge"]).describe("Type of operation"),
        tokenAddress: z.string().optional().describe("Token contract address (for ERC20 transfers)"),
      },
    },
    async ({ network, operation, tokenAddress }) => {
      try {
        // Mock fee estimation - in production, this would call actual gas estimation APIs
        const baseFees = {
          ethereum: { swap: '0.015', transfer: '0.005', stake: '0.02', bridge: '0.03' },
          arbitrum: { swap: '0.002', transfer: '0.001', stake: '0.003', bridge: '0.005' },
          polygon: { swap: '0.01', transfer: '0.005', stake: '0.015', bridge: '0.02' }
        };

        const feeETH = baseFees[network][operation];
        const feeUSD = (parseFloat(feeETH) * 2500).toFixed(2); // Mock ETH price

        return {
          content: [
            {
              type: "text",
              text: `Fee Estimate for ${operation} on ${network}:\n\nGas Fee: ${feeETH} ETH (~$${feeUSD})\nNetwork: ${network}\nOperation: ${operation}${tokenAddress ? `\nToken: ${tokenAddress}` : ''}`,
            },
          ],
          structuredContent: {
            network,
            operation,
            tokenAddress,
            estimatedFee: {
              eth: feeETH,
              usd: feeUSD
            },
            timestamp: new Date().toISOString(),
          },
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error estimating fees: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );

  // Get Transaction Status Tool
  server.registerTool(
    "get_transaction_status",
    {
      title: "Get Transaction Status",
      description: "Check the status of a blockchain transaction and get confirmation details",
      inputSchema: {
        txHash: z.string().describe("Transaction hash to check"),
        network: z.enum(["ethereum", "arbitrum", "polygon"]).describe("Blockchain network"),
      },
    },
    async ({ txHash, network }) => {
      try {
        const response = await fetch(`${baseURL}/api/mcp/transfer?txHash=${txHash}&network=${network}`);
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to get transaction status');
        }

        const { data } = result;
        
        return {
          content: [
            {
              type: "text",
              text: `Transaction Status: ${data.status}\n\nTx Hash: ${txHash}\nNetwork: ${network}\nBlock: ${data.blockNumber || 'Pending'}\nGas Used: ${data.gasUsed || 'N/A'}\n\nExplorer: ${data.explorerUrl}`,
            },
          ],
          structuredContent: {
            txHash,
            network,
            status: data.status,
            blockNumber: data.blockNumber,
            gasUsed: data.gasUsed,
            explorerUrl: data.explorerUrl,
            timestamp: new Date().toISOString(),
          },
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error checking transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );
});

export const GET = handler;
export const POST = handler;
