import { Router } from 'express';
import prisma from '../db';

export const accommodationRoutes = Router();

accommodationRoutes.get('/trip/:tripId', async (req, res) => {
  try {
    const accommodations = await prisma.accommodation.findMany({
      where: { tripId: req.params.tripId },
      orderBy: { checkIn: 'asc' },
      include: { destination: true },
    });
    res.json(accommodations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch accommodations' });
  }
});

accommodationRoutes.post('/', async (req, res) => {
  try {
    const accommodation = await prisma.accommodation.create({ data: req.body });
    res.status(201).json(accommodation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create accommodation' });
  }
});

accommodationRoutes.put('/:id', async (req, res) => {
  try {
    const accommodation = await prisma.accommodation.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(accommodation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update accommodation' });
  }
});

accommodationRoutes.delete('/:id', async (req, res) => {
  try {
    await prisma.accommodation.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete accommodation' });
  }
});
