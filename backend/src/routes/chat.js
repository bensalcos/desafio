const express = require('express');
const router = express.Router();
const { handleChat } = require('../services/ai.service');
const { prisma } = require('../services/db');

// Obtener historial
router.get('/history', async (req, res) => {
  try {
    const messages = await prisma.chatMessage.findMany({
      orderBy: { created_at: 'asc' }
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener historial' });
  }
});

// Enviar nuevo mensaje
router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });
    
    // Guardar mensaje del usuario
    await prisma.chatMessage.create({ data: { role: 'user', content: message } });

    // Obtener historial completo para el contexto
    const history = await prisma.chatMessage.findMany({
      orderBy: { created_at: 'asc' }
    });

    // Formatear historial para OpenAI
    const formattedHistory = history.map(msg => ({
      role: msg.role === 'ai' ? 'assistant' : 'user',
      content: msg.content
    }));

    // Pasar historial completo al asistente
    const response = await handleChat(formattedHistory);
    
    // Guardar respuesta de la IA
    await prisma.chatMessage.create({ data: { role: 'ai', content: response } });

    res.json({ response });
  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({ error: 'Error procesando tu solicitud con la IA', details: error.message });
  }
});

module.exports = router;
