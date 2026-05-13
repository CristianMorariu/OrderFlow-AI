type OrderData = {
  orderNumber: string;
  status: string;
  priority: string;
  totalAmount: number;
  currency: string;
  placedAt: Date;
  hasIssue: boolean;
  issueType: string | null;
  needsFollowUp: boolean;
  customer: { fullName: string; email: string; phone: string | null };
  assignedToUser: { name: string } | null;
  items: Array<{
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
  }>;
  notes: Array<{ body: string; authorUser: { name: string }; createdAt: Date }>;
  activityLogs: Array<{
    actionType: string;
    actorUser: { name: string };
    createdAt: Date;
  }>;
  returns: Array<{ status: string; reason: string; requestedAt: Date }>;
};

type AIResult = {
  summary: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  suggestedActions: string[];
};

export async function generateAISummary(order: OrderData): Promise<AIResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }

  // Construim un prompt descriptiv cu toate datele comenzii
  const prompt = buildPrompt(order);

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini", // sau "google/gemini-2.0-flash-001" – mai ieftin
        messages: [
          {
            role: "system",
            content: `You are an AI assistant for an e-commerce operations team. 
Analyze the order data and return a JSON object with:
- "summary": a 2-3 sentence analysis of the order status, risks, and what needs attention
- "riskLevel": "LOW", "MEDIUM", or "HIGH" based on the data
- "suggestedActions": an array of 2-4 actionable next steps for the operations team

Return ONLY valid JSON, no markdown, no code blocks.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("No content in OpenRouter response");
  }

  // Parse the JSON response
  try {
    const parsed = JSON.parse(content);
    return {
      summary: parsed.summary || "No summary generated.",
      riskLevel: ["LOW", "MEDIUM", "HIGH"].includes(parsed.riskLevel)
        ? parsed.riskLevel
        : "LOW",
      suggestedActions: Array.isArray(parsed.suggestedActions)
        ? parsed.suggestedActions
        : [],
    };
  } catch {
    throw new Error(`Failed to parse AI response: ${content}`);
  }
}

function buildPrompt(order: OrderData): string {
  return `Analyze this order for the operations team:

Order #${order.orderNumber}
Status: ${order.status}
Priority: ${order.priority}
Total: ${order.totalAmount} ${order.currency}
Placed: ${order.placedAt.toISOString().split("T")[0]}

Customer: ${order.customer.fullName} (${order.customer.email})
Assigned to: ${order.assignedToUser?.name ?? "Unassigned"}

Has Issue: ${order.hasIssue ? `Yes - ${order.issueType}` : "No"}
Needs Follow-up: ${order.needsFollowUp ? "Yes" : "No"}

Items:
${order.items.map((i) => `  - ${i.productName} (SKU: ${i.sku}) x${i.quantity} @ ${i.unitPrice}`).join("\n")}

Recent Notes:
${order.notes
  .slice(0, 5)
  .map(
    (n) =>
      `  [${n.createdAt.toISOString().split("T")[0]}] ${n.authorUser.name}: ${n.body}`,
  )
  .join("\n")}

Recent Activity:
${order.activityLogs
  .slice(0, 5)
  .map(
    (a) =>
      `  [${a.createdAt.toISOString().split("T")[0]}] ${a.actorUser.name}: ${a.actionType}`,
  )
  .join("\n")}

Returns:
${order.returns.length > 0 ? order.returns.map((r) => `  Status: ${r.status} - ${r.reason}`).join("\n") : "  None"}`;
}
