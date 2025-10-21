import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// MCP Tools definitions for LLM
const mcpTools = [
  {
    type: "function" as const,
    function: {
      name: "get_portfolio",
      description: "Analyze DeFi portfolio across multiple blockchain networks using AURA API",
      parameters: {
        type: "object",
        properties: {
          address: {
            type: "string",
            description: "Wallet address to analyze (0x...)",
            pattern: "^0x[a-fA-F0-9]{40}$"
          },
          chains: {
            type: "array",
            items: {
              type: "string",
              enum: ["ethereum", "arbitrum", "polygon", "bsc", "avalanche"]
            },
            description: "Blockchain networks to analyze",
            default: ["ethereum"]
          }
        },
        required: ["address"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "get_strategy",
      description: "Get AI-powered DeFi strategy recommendations using AURA API",
      parameters: {
        type: "object",
        properties: {
          address: {
            type: "string",
            description: "Wallet address for strategy analysis",
            pattern: "^0x[a-fA-F0-9]{40}$"
          },
          risk_level: {
            type: "string",
            enum: ["low", "medium", "high"],
            description: "Risk tolerance level",
            default: "medium"
          },
          strategy_type: {
            type: "string",
            enum: ["yield_farming", "staking", "liquidity_provision", "arbitrage", "lending", "all"],
            description: "Type of DeFi strategy to recommend",
            default: "all"
          },
          min_apy: {
            type: "number",
            description: "Minimum APY requirement (%)",
            minimum: 0,
            default: 5
          }
        },
        required: ["address"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "execute_action",
      description: "Execute DeFi actions like swaps, stakes, or liquidity provision",
      parameters: {
        type: "object",
        properties: {
          action: {
            type: "string",
            enum: ["swap", "stake", "unstake", "provide_liquidity", "remove_liquidity", "lend", "borrow"],
            description: "Type of DeFi action to execute"
          },
          fromToken: {
            type: "string",
            description: "Source token symbol (e.g., ETH, USDC)"
          },
          toToken: {
            type: "string",
            description: "Destination token symbol (e.g., USDC, DAI)"
          },
          amount: {
            type: "string",
            description: "Amount to process (in token units)"
          },
          slippage: {
            type: "number",
            description: "Maximum slippage tolerance (%)",
            minimum: 0.1,
            maximum: 50,
            default: 0.5
          },
          chain: {
            type: "string",
            enum: ["ethereum", "arbitrum", "polygon", "bsc", "avalanche"],
            description: "Blockchain network",
            default: "ethereum"
          },
          protocol: {
            type: "string",
            description: "DeFi protocol to use (e.g., Uniswap, Aave, Compound)"
          }
        },
        required: ["action", "amount", "chain"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "transfer_tokens",
      description: "Transfer tokens between wallets with fee estimation",
      parameters: {
        type: "object",
        properties: {
          fromAddress: {
            type: "string",
            description: "Source wallet address",
            pattern: "^0x[a-fA-F0-9]{40}$"
          },
          toAddress: {
            type: "string",
            description: "Destination wallet address",
            pattern: "^0x[a-fA-F0-9]{40}$"
          },
          token: {
            type: "string",
            description: "Token symbol to transfer (e.g., ETH, USDC, DAI)"
          },
          amount: {
            type: "string",
            description: "Amount to transfer (in token units)"
          },
          chain: {
            type: "string",
            enum: ["ethereum", "arbitrum", "polygon", "bsc", "avalanche"],
            description: "Blockchain network",
            default: "ethereum"
          }
        },
        required: ["fromAddress", "toAddress", "token", "amount"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "estimate_fees",
      description: "Estimate gas fees for DeFi transactions",
      parameters: {
        type: "object",
        properties: {
          action: {
            type: "string",
            enum: ["swap", "transfer", "stake", "unstake", "provide_liquidity", "remove_liquidity"],
            description: "Type of transaction to estimate"
          },
          chain: {
            type: "string",
            enum: ["ethereum", "arbitrum", "polygon", "bsc", "avalanche"],
            description: "Blockchain network",
            default: "ethereum"
          },
          priority: {
            type: "string",
            enum: ["slow", "standard", "fast"],
            description: "Transaction priority level",
            default: "standard"
          }
        },
        required: ["action", "chain"]
      }
    }
  }
];

export async function POST(request: NextRequest) {
  try {
    const { messages, walletAddress } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Add system message about MCP tools and wallet context
    const systemMessage = {
      role: 'system',
      content: `You are MCP AURA AI, an intelligent DeFi assistant powered by AURA API. This is the web application interface that directly uses OpenAI API with MCP tools integration.

Available tools (accessible via function calling):
- get_portfolio: Analyze wallet portfolio across multiple chains
- get_strategy: Get personalized DeFi strategy recommendations
- execute_action: Execute DeFi actions like swaps, stakes, etc.
- transfer_tokens: Transfer tokens between wallets
- estimate_fees: Estimate gas fees for transactions

${walletAddress ? `User's connected wallet address: ${walletAddress}` : 'No wallet connected yet'}

This web app provides direct access to AURA API through OpenAI function calling, giving you real-time DeFi insights and automation capabilities. Always be helpful, provide clear explanations, and suggest appropriate actions based on the user's portfolio and goals. When suggesting actions, explain the risks and potential returns.`
    };

    const conversation = [systemMessage, ...messages];

    // Call OpenAI API with function calling
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: conversation,
      tools: mcpTools,
      tool_choice: 'auto',
    });

    const response = completion.choices[0];
    const responseMessage = response.message;

    // Check if LLM wants to call a tool
    if (responseMessage.tool_calls) {
      // Execute the tool calls
      const toolResults = await Promise.all(
        responseMessage.tool_calls.map(async (toolCall) => {
          try {
            const result = await executeMCPTool((toolCall as any).function.name, JSON.parse((toolCall as any).function.arguments));
            return {
              tool_call_id: toolCall.id,
              role: 'tool',
              content: JSON.stringify(result)
            };
          } catch (error) {
            return {
              tool_call_id: toolCall.id,
              role: 'tool',
              content: JSON.stringify({ error: (error as Error).message })
            };
          }
        })
      );

      // Get final response after tool execution
      const finalCompletion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [...conversation, responseMessage, ...toolResults],
      });

      return NextResponse.json({
        message: finalCompletion.choices[0].message.content,
        toolCalls: responseMessage.tool_calls
      });
    }

    return NextResponse.json({
      message: responseMessage.content
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}

async function executeMCPTool(functionName: string, args: any) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  switch (functionName) {
    case 'get_portfolio':
      const portfolioResponse = await fetch(`${baseUrl}/api/mcp/portfolio?address=${args.address}`);
      return await portfolioResponse.json();

    case 'get_strategy':
      const strategyResponse = await fetch(`${baseUrl}/api/mcp/strategy?address=${args.address}&risk_level=${args.risk_level || 'medium'}&strategy_type=${args.strategy_type || 'all'}&min_apy=${args.min_apy || 5}`);
      return await strategyResponse.json();

    case 'execute_action':
      const actionResponse = await fetch(`${baseUrl}/api/mcp/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(args)
      });
      return await actionResponse.json();

    case 'transfer_tokens':
      const transferResponse = await fetch(`${baseUrl}/api/mcp/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(args)
      });
      return await transferResponse.json();

    case 'estimate_fees':
      // This would need to be implemented in the MCP API
      return { estimatedFee: '0.001 ETH', priority: args.priority || 'standard' };

    default:
      throw new Error(`Unknown tool: ${functionName}`);
  }
}
