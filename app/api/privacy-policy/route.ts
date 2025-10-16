// ENVXX MCP AURA - Privacy Policy API Route
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const privacyPolicy = {
      success: true,
      data: {
        version: "1.0.0",
        lastUpdated: "2025-10-16",
        effectiveDate: "2025-10-16",
        organization: {
          name: "ENVXX",
          contact: "contact@envxx.com",
          website: "https://github.com/envexx/mcp-aura"
        },
        policyDetails: {
          dataCollection: {
            description: "We collect minimal data necessary for DeFi portfolio analysis and AI-powered recommendations",
            typesCollected: [
              "Wallet addresses (public blockchain data)",
              "Transaction history (public blockchain data)",
              "Portfolio preferences and settings",
              "Usage analytics for service improvement"
            ],
            notCollected: [
              "Private keys or seed phrases",
              "Personal identification information",
              "Email addresses or contact information",
              "Financial account details"
            ]
          },
          dataUsage: {
            purposes: [
              "Portfolio analysis and DeFi position tracking",
              "AI-powered strategy recommendations",
              "Cross-chain opportunity identification",
              "Service optimization and improvement",
              "Security monitoring and fraud prevention"
            ],
            aiProcessing: {
              description: "We use AI to analyze portfolio data and provide personalized DeFi recommendations",
              dataRetention: "Portfolio analysis data is processed in real-time and not permanently stored",
              thirdPartyAI: "We may use third-party AI services for enhanced analysis while maintaining data privacy"
            }
          },
          dataSharing: {
            policy: "We do not sell, rent, or share personal data with third parties",
            exceptions: [
              "Public blockchain data (already publicly available)",
              "Aggregated, anonymized usage statistics",
              "Legal compliance when required by law"
            ],
            blockchainData: {
              note: "Wallet addresses and transaction data are public on blockchain networks",
              privacy: "We access only publicly available blockchain information"
            }
          },
          dataSecurity: {
            measures: [
              "End-to-end encryption for all communications",
              "Secure API endpoints with rate limiting",
              "No storage of sensitive wallet information",
              "Regular security audits and updates",
              "Compliance with Web3 security best practices"
            ],
            walletSecurity: {
              nonCustodial: "We never have access to your private keys or funds",
              userControl: "You maintain full control of your wallet and assets",
              permissions: "We only request read-only access to public wallet data"
            }
          },
          userRights: {
            access: "You can request information about data we process for your wallet",
            correction: "You can update preferences and settings at any time",
            deletion: "You can request deletion of any stored preferences or settings",
            portability: "You can export your settings and preferences",
            withdrawal: "You can stop using our services at any time"
          },
          cookies: {
            usage: "We use minimal cookies for service functionality and user experience",
            types: [
              "Essential cookies for service operation",
              "Analytics cookies for service improvement (anonymized)",
              "Preference cookies for user settings"
            ],
            control: "You can manage cookie preferences in your browser settings"
          },
          compliance: {
            frameworks: [
              "GDPR (General Data Protection Regulation)",
              "CCPA (California Consumer Privacy Act)",
              "Web3 Privacy Standards",
              "Blockchain Data Protection Guidelines"
            ],
            updates: "We will notify users of any material changes to this privacy policy"
          },
          contact: {
            questions: "For privacy-related questions, contact us through our GitHub repository",
            complaints: "You have the right to file complaints with relevant data protection authorities",
            response: "We will respond to privacy inquiries within 30 days"
          }
        },
        technicalDetails: {
          dataMinimization: "We follow data minimization principles, collecting only necessary information",
          encryption: "All data transmission uses TLS 1.3 encryption",
          storage: "Minimal data storage with automatic expiration policies",
          anonymization: "Personal data is anonymized whenever possible",
          auditTrail: "We maintain audit logs for security and compliance purposes"
        },
        web3Specific: {
          decentralization: "Our service respects the decentralized nature of Web3",
          selfSovereignty: "Users maintain sovereignty over their data and assets",
          transparency: "Our privacy practices align with Web3 transparency principles",
          interoperability: "Privacy settings work across supported blockchain networks"
        }
      }
    };

    return NextResponse.json(privacyPolicy, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

  } catch (error) {
    console.error('Privacy Policy API Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve privacy policy',
        message: 'Please try again later or contact support'
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
