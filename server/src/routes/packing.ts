import { Router } from 'express';
import prisma from '../db';

export const packingRoutes = Router();

packingRoutes.get('/trip/:tripId', async (req, res) => {
  try {
    const items = await prisma.packingItem.findMany({
      where: { tripId: req.params.tripId },
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch packing items' });
  }
});

packingRoutes.post('/', async (req, res) => {
  try {
    const item = await prisma.packingItem.create({ data: req.body });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create packing item' });
  }
});

packingRoutes.post('/bulk', async (req, res) => {
  try {
    const { items } = req.body as { items: any[] };
    const created = await prisma.packingItem.createMany({ data: items });
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create packing items' });
  }
});

packingRoutes.put('/:id', async (req, res) => {
  try {
    const item = await prisma.packingItem.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update packing item' });
  }
});

packingRoutes.delete('/:id', async (req, res) => {
  try {
    await prisma.packingItem.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete packing item' });
  }
});
