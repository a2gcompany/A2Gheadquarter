import Anthropic from "@anthropic-ai/sdk"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface DocumentAnalysisResult {
  documentType: string
  extractedData: any
  kpis: Array<{
    type: string
    name: string
    value: number
    currency?: string
    periodStart?: string
    periodEnd?: string
  }>
  insights: string[]
  confidence: number
}

export async function analyzeDocument(
  fileContent: string,
  fileName: string,
  mimeType: string
): Promise<DocumentAnalysisResult> {
  const prompt = `
You are a financial and business intelligence analyst. Analyze this document and extract all relevant information.

Document: ${fileName}

Please analyze and extract:
1. Document type (invoice, financial_statement, contract, bank_statement, report, etc.)
2. All financial metrics and KPIs (revenue, expenses, profit, cashflow, ROAS, etc.)
3. Key dates and periods
4. Important insights and anomalies
5. Actionable recommendations

Return a JSON object with this structure:
{
  "documentType": "type",
  "extractedData": {
    // All extracted raw data
  },
  "kpis": [
    {
      "type": "revenue|expense|profit|cashflow|roas|conversion_rate|etc",
      "name": "Descriptive name",
      "value": numeric_value,
      "currency": "USD|EUR|etc",
      "periodStart": "YYYY-MM-DD",
      "periodEnd": "YYYY-MM-DD"
    }
  ],
  "insights": [
    "Key insight 1",
    "Key insight 2"
  ],
  "confidence": 0.0-1.0
}

Document content:
${fileContent}
`

  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    })

    const content = message.content[0]
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude")
    }

    // Extract JSON from response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Could not extract JSON from Claude response")
    }

    const result: DocumentAnalysisResult = JSON.parse(jsonMatch[0])
    return result
  } catch (error) {
    console.error("Error analyzing document with Claude:", error)
    throw error
  }
}

export async function categorizeTransaction(
  description: string,
  amount: number,
  merchantName?: string
): Promise<{
  category: string
  subcategory: string
  confidence: number
}> {
  const prompt = `
Categorize this transaction:
Description: ${description}
Amount: ${amount}
Merchant: ${merchantName || "Unknown"}

Return JSON:
{
  "category": "travel|marketing|salary|technology|office|legal|entertainment|food|etc",
  "subcategory": "specific subcategory",
  "confidence": 0.0-1.0
}
`

  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 256,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    })

    const content = message.content[0]
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude")
    }

    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Could not extract JSON from Claude response")
    }

    return JSON.parse(jsonMatch[0])
  } catch (error) {
    console.error("Error categorizing transaction:", error)
    return {
      category: "uncategorized",
      subcategory: "other",
      confidence: 0,
    }
  }
}

export async function chatWithData(
  userMessage: string,
  context: {
    companies?: any[]
    transactions?: any[]
    kpis?: any[]
    documents?: any[]
  }
): Promise<string> {
  const contextString = JSON.stringify(context, null, 2)

  const prompt = `
You are a business intelligence assistant with access to the user's financial and business data.

Available context:
${contextString}

User question: ${userMessage}

Provide a clear, concise, and actionable answer based on the data. Include specific numbers and insights.
If you detect trends, anomalies, or opportunities, mention them.
`

  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    })

    const content = message.content[0]
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude")
    }

    return content.text
  } catch (error) {
    console.error("Error in chat with Claude:", error)
    throw error
  }
}

export async function generateInsights(data: {
  companies: any[]
  financialSummary: any[]
  recentTransactions: any[]
  kpis: any[]
}): Promise<string[]> {
  const prompt = `
Analyze this business data and generate actionable insights and recommendations:

${JSON.stringify(data, null, 2)}

Return a JSON array of 5-10 key insights:
[
  "Insight 1",
  "Insight 2",
  ...
]

Focus on:
- Revenue trends and opportunities
- Cost optimization
- Cash flow management
- Growth opportunities
- Risk factors
- Anomalies or unusual patterns
`

  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    })

    const content = message.content[0]
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude")
    }

    const jsonMatch = content.text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error("Could not extract JSON array from Claude response")
    }

    return JSON.parse(jsonMatch[0])
  } catch (error) {
    console.error("Error generating insights:", error)
    return []
  }
}
