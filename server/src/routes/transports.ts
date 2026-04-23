import { Router } from 'express';
import prisma from '../db';

export const transportRoutes = Router();

transportRoutes.get('/trip/:tripId', async (req, res) => {
  try {
    const transports = await prisma.transport.findMany({
      where: { tripId: req.params.tripId },
      orderBy: { departureDate: 'asc' },
    });
    res.json(transports);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transports' });
  }
});

transportRoutes.post('/', async (req, res) => {
  try {
    const transport = await prisma.transport.create({ data: req.body });
    res.status(201).json(transport);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create transport' });
  }
});

transportRoutes.put('/:id', async (req, res) => {
  try {
    const transport = await prisma.transport.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(transport);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update transport' });
  }
});

transportRoutes.delete('/:id', async (req, res) => {
  try {
    await prisma.transport.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete transport' });
  }
});
