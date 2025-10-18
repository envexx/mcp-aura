import { ethers } from 'ethers'
import { AlphaRouter, SwapType } from '@uniswap/smart-order-router'
import { Token, CurrencyAmount, TradeType, Percent } from '@uniswap/sdk-core'

// Base network config
const BASE_RPC = 'https://mainnet.base.org'
const BASE_CHAIN_ID = 8453

// Token addresses di Base
const WETH_ADDRESS = '0x4200000000000000000000000000000000000006'
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'

// Token decimals
const WETH_DECIMALS = 18
const USDC_DECIMALS = 6

// swap parameter
const AMOUNT_IN_ETH = '0.001'
const SLIPPAGE = 0.05 // 0.05%

async function main() {
  console.log('🔧 Setting up Base network connection...')

  // Init provider
  const provider = new ethers.providers.JsonRpcProvider(BASE_RPC)

  try {
    // Test basic connection
    console.log('🌐 Testing blockchain connection...')
    const blockNumber = await provider.getBlockNumber()
    console.log('✅ Connected to Base, current block:', blockNumber)

    // Check network
    const network = await provider.getNetwork()
    console.log('📡 Network info:', {
      chainId: network.chainId,
      name: network.name
    })

  } catch (connectionError) {
    console.error('❌ Connection failed:', connectionError.message)
    return
  }

  // Define tokens
  const WETH = new Token(BASE_CHAIN_ID, WETH_ADDRESS, WETH_DECIMALS, 'WETH', 'Wrapped ETH')
  const USDC = new Token(BASE_CHAIN_ID, USDC_ADDRESS, USDC_DECIMALS, 'USDC', 'Usd Coin')

  console.log('🪙 Tokens defined:', {
    WETH: WETH.address,
    USDC: USDC.address
  })

  // AmountIn dalam format smallest units (wei)
  const amountIn = ethers.utils.parseUnits(AMOUNT_IN_ETH, WETH_DECIMALS).toString()
  const amountInCurrency = CurrencyAmount.fromRawAmount(WETH, amountIn)

  console.log('💸 Amount to swap:', AMOUNT_IN_ETH, 'ETH')

  // Setup AlphaRouter
  console.log('🎯 Creating AlphaRouter...')
  let router
  try {
    router = new AlphaRouter({
      chainId: BASE_CHAIN_ID,
      provider: provider
    })
    console.log('✅ AlphaRouter created successfully')
  } catch (routerError) {
    console.error('❌ AlphaRouter creation failed:', routerError.message)
    return
  }

  // Slippage tolerance
  const slippageTolerance = new Percent(Math.floor(SLIPPAGE * 100), 10000) // 0.05% = 5/10000

  // Recipient
  const recipient = '0xd3a12CA02256CD74AD8659974cfF36f62Aa0485c'

  console.log('📊 Swap parameters:', {
    amountIn: AMOUNT_IN_ETH,
    slippage: SLIPPAGE,
    recipient: recipient
  })

  // Call route
  console.log('🔍 Finding best route...')
  try {
    // Add timeout to route finding
    const routePromise = router.route(
      amountInCurrency,
      USDC,
      TradeType.EXACT_INPUT,
      {
        recipient: recipient,
        slippageTolerance,
        deadline: Math.floor(Date.now() / 1000) + 1200, // 20 menit
        type: SwapType.SWAP_ROUTER_02
      }
    )

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Route finding timeout after 30 seconds')), 30000)
    })

    const route = await Promise.race([routePromise, timeoutPromise])

    console.log('🔎 Route result:', route ? 'Found' : 'Not found')

    // Indikator keberhasilan
    if (route && route.methodParameters) {
      console.log('✅ Route Berhasil Ditemukan!')
      console.log('Rincian Route:')
      console.log('- Amount In (WETH):', AMOUNT_IN_ETH)
      console.log('- Estimasi Out (USDC):', route.quote.toFixed(6))
      console.log('- Gas Estimasi:', route.estimatedGasUsed.toString())
      console.log('- To (Router):', route.methodParameters.to)
      console.log('- CallData Length:', route.methodParameters.calldata.length)
      console.log('- Value:', route.methodParameters.value)

    } else {
      console.error('❌ Route TIDAK ditemukan!')
      console.log('Route object:', JSON.stringify(route, null, 2))
    }
  } catch (routeError) {
    console.error('💥 Route finding failed:', routeError.message)
    if (routeError.stack) {
      console.error('Stack trace:', routeError.stack)
    }
  }
}

main()
  .then(() => {
    console.log('🏁 Script completed successfully')
    process.exit(0)
  })
  .catch(e => {
    console.error('💥 Script failed:', e.message)
    process.exit(1)
  })
