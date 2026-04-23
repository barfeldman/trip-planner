import { Router } from 'express';
import prisma from '../db';

export const activityRoutes = Router();

activityRoutes.get('/trip/:tripId', async (req, res) => {
  try {
    const activities = await prisma.activity.findMany({
      where: { tripId: req.params.tripId },
      orderBy: { sortOrder: 'asc' },
      include: { destination: true, day: true },
    });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

activityRoutes.get('/day/:dayId', async (req, res) => {
  try {
    const activities = await prisma.activity.findMany({
      where: { dayId: req.params.dayId },
      orderBy: { sortOrder: 'asc' },
    });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

activityRoutes.post('/', async (req, res) => {
  try {
    const activity = await prisma.activity.create({ data: req.body });
    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create activity' });
  }
});

activityRoutes.put('/:id', async (req, res) => {
  try {
    const activity = await prisma.activity.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update activity' });
  }
});

activityRoutes.put('/reorder/:dayId', async (req, res) => {
  try {
    const { activityIds } = req.body as { activityIds: string[] };
    const updates = activityIds.map((id, index) =>
      prisma.activity.update({ where: { id }, data: { sortOrder: index } })
    );
    await prisma.$transaction(updates);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reorder activities' });
  }
});

activityRoutes.delete('/:id', async (req, res) => {
  try {
    await prisma.activity.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete activity' });
  }
});
