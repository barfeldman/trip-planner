import { Router } from 'express';
import prisma from '../db';

export const dayRoutes = Router();

dayRoutes.get('/trip/:tripId', async (req, res) => {
  try {
    const days = await prisma.day.findMany({
      where: { tripId: req.params.tripId },
      orderBy: { dayNumber: 'asc' },
      include: {
        activities: { orderBy: { sortOrder: 'asc' } },
        destination: true,
      },
    });
    res.json(days);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch days' });
  }
});

dayRoutes.post('/', async (req, res) => {
  try {
    const day = await prisma.day.create({ data: req.body });
    res.status(201).json(day);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create day' });
  }
});

dayRoutes.put('/:id', async (req, res) => {
  try {
    const day = await prisma.day.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(day);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update day' });
  }
});

dayRoutes.put('/reorder/:tripId', async (req, res) => {
  try {
    const { dayIds } = req.body as { dayIds: string[] };
    const updates = dayIds.map((id, index) =>
      prisma.day.update({ where: { id }, data: { sortOrder: index, dayNumber: index + 1 } })
    );
    await prisma.$transaction(updates);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reorder days' });
  }
});

dayRoutes.delete('/:id', async (req, res) => {
  try {
    await prisma.day.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete day' });
  }
});
