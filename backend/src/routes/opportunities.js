const express = require('express');
const router = express.Router();
const { z } = require('zod');
const { prisma } = require('../services/db');
const { checkRole } = require('../middleware/auth');

const opportunitySchema = z.object({
  company_name: z.string().min(1),
  contact_name: z.string().min(1),
  contact_email: z.string().email(),
  opportunity_name: z.string().min(1),
  description: z.string().optional(),
  estimated_value: z.number().nonnegative(),
  currency: z.string(),
  stage: z.string(),
  priority: z.string(),
  probability: z.number().min(0).max(100),
  owner: z.string(),
  next_follow_up_date: z.string()
});

router.get('/', async (req, res) => {
  try {
    const opportunities = await prisma.opportunity.findMany({
      orderBy: { created_at: 'desc' }
    });
    res.json(opportunities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener oportunidades' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const opp = await prisma.opportunity.findUnique({ where: { id: req.params.id } });
    if (!opp) return res.status(404).json({ error: 'Not found' });
    res.json(opp);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener oportunidad' });
  }
});

router.post('/', checkRole(['ADMIN', 'COMERCIAL']), async (req, res) => {
  try {
    const data = opportunitySchema.parse(req.body);
    const { next_follow_up_date, ...rest } = data;
    const opp = await prisma.opportunity.create({
      data: {
        ...rest,
        next_follow_up_date: new Date(next_follow_up_date)
      }
    });
    res.status(201).json(opp);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation Error', details: error.errors });
    }
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/:id', checkRole(['ADMIN', 'COMERCIAL']), async (req, res) => {
  try {
    const data = opportunitySchema.partial().parse(req.body);
    const { next_follow_up_date, ...rest } = data;
    const opp = await prisma.opportunity.update({
      where: { id: req.params.id },
      data: {
        ...rest,
        ...(next_follow_up_date && { next_follow_up_date: new Date(next_follow_up_date) })
      }
    });
    res.json(opp);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', checkRole(['ADMIN']), async (req, res) => {
  try {
    await prisma.opportunity.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
