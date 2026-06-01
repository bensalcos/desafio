const OpenAI = require('openai');
const { prisma } = require('./db');
const fs = require('fs');
const path = require('path');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const tools = [
  {
    type: 'function',
    function: {
      name: 'getOpportunitiesByStage',
      description: 'Obtiene el listado de oportunidades filtrado por su etapa comercial (stage). Usa esta función cuando el usuario pregunte por oportunidades en negociación, perdidas, ganadas, etc.',
      parameters: {
        type: 'object',
        properties: {
          stage: {
            type: 'string',
            description: 'La etapa comercial (ej. "Negociación", "Ganado", "Perdido", "Lead nuevo")'
          }
        },
        required: ['stage']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'getHighPriorityOpportunities',
      description: 'Obtiene las oportunidades marcadas con prioridad alta o crítica. Útil para saber qué clientes necesitan atención urgente.',
      parameters: { type: 'object', properties: {} }
    }
  },
  {
    type: 'function',
    function: {
      name: 'getPipelineSummary',
      description: 'Obtiene un resumen del pipeline con el valor total estimado y la cantidad de oportunidades.',
      parameters: { type: 'object', properties: {} }
    }
  }
];

async function handleToolCall(toolCall) {
  const name = toolCall.function.name;
  const args = JSON.parse(toolCall.function.arguments || '{}');
  
  try {
    switch (name) {
      case 'getOpportunitiesByStage': {
        const opps = await prisma.opportunity.findMany({
          where: { stage: { contains: args.stage, mode: 'insensitive' } },
          select: { opportunity_name: true, company_name: true, estimated_value: true, priority: true }
        });
        return JSON.stringify(opps);
      }
      case 'getHighPriorityOpportunities': {
        const opps = await prisma.opportunity.findMany({
          where: { priority: { in: ['Crítica', 'Alta'] } },
          select: { opportunity_name: true, company_name: true, priority: true, next_follow_up_date: true }
        });
        return JSON.stringify(opps);
      }
      case 'getPipelineSummary': {
        const result = await prisma.opportunity.aggregate({
          _sum: { estimated_value: true },
          _count: { id: true }
        });
        return JSON.stringify({ totalValue: result._sum.estimated_value || 0, count: result._count.id });
      }
      default:
        return 'Function not found.';
    }
  } catch (e) {
    console.error(e);
    return `Error ejecutando ${name}: ${e.message}`;
  }
}

async function handleChat(formattedHistory) {
  // Leer el prompt versionado desde el sistema de archivos
  const promptPath = path.join(__dirname, '../../prompts/system_prompt_v1.md');
  const systemPrompt = fs.readFileSync(promptPath, 'utf-8');

  const messages = [
    { role: 'system', content: systemPrompt },
    ...formattedHistory
  ];

  let response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: messages,
    tools: tools,
    tool_choice: 'auto'
  });
  
  let responseMessage = response.choices[0].message;

  while (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
    messages.push(responseMessage);
    
    for (const toolCall of responseMessage.tool_calls) {
      const functionResponse = await handleToolCall(toolCall);
      messages.push({
        tool_call_id: toolCall.id,
        role: 'tool',
        name: toolCall.function.name,
        content: functionResponse,
      });
    }

    response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      tools: tools
    });
    
    responseMessage = response.choices[0].message;
  }

  return responseMessage.content;
}

module.exports = { handleChat };
