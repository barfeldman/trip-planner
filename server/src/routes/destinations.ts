import { Router } from 'express';
import prisma from '../db';

export const destinationRoutes = Router();

destinationRoutes.get('/trip/:tripId', async (req, res) => {
  try {
    const destinations = await prisma.destination.findMany({
      where: { tripId: req.params.tripId },
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { days: true, activities: true, accommodations: true } } },
    });
    res.json(destinations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch destinations' });
  }
});

destinationRoutes.post('/', async (req, res) => {
  try {
    const dest = await prisma.destination.create({ data: req.body });
    res.status(201).json(dest);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create destination' });
  }
});

destinationRoutes.put('/:id', async (req, res) => {
  try {
    const dest = await prisma.destination.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(dest);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update destination' });
  }
});

destinationRoutes.delete('/:id', async (req, res) => {
  try {
    await prisma.destination.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete destination' });
  }
});
