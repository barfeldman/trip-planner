import { Router } from 'express';
import prisma from '../db';

export const budgetRoutes = Router();

budgetRoutes.get('/trip/:tripId', async (req, res) => {
  try {
    const items = await prisma.budgetItem.findMany({
      where: { tripId: req.params.tripId },
      orderBy: { category: 'asc' },
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch budget items' });
  }
});

budgetRoutes.get('/summary/:tripId', async (req, res) => {
  try {
    const [items, trip] = await Promise.all([
      prisma.budgetItem.findMany({ where: { tripId: req.params.tripId } }),
      prisma.trip.findUnique({ where: { id: req.params.tripId } }),
    ]);
    const home = trip?.homeCurrency || 'ILS';
    const exchangeRate = trip?.exchangeRate || 8.5;
    const usdRate = (trip as any)?.usdRate || 3.7;

    function toHome(amount: number, currency: string): number {
      if (currency === home) return amount;
      if (currency === 'THB') return amount / exchangeRate;
      if (currency === 'USD') return amount * usdRate;
      return amount;
    }

    const summary = items.reduce(
      (acc, item) => {
        if (!acc[item.category]) acc[item.category] = { planned: 0, actual: 0 };
        acc[item.category].planned += toHome(item.planned, item.currency);
        acc[item.category].actual += toHome(item.actual, item.currency);
        return acc;
      },
      {} as Record<string, { planned: number; actual: number }>
    );
    const totalPlanned = items.reduce((sum, i) => sum + toHome(i.planned, i.currency), 0);
    const totalActual = items.reduce((sum, i) => sum + toHome(i.actual, i.currency), 0);
    res.json({ categories: summary, totalPlanned, totalActual });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch budget summary' });
  }
});

budgetRoutes.post('/', async (req, res) => {
  try {
    const item = await prisma.budgetItem.create({ data: req.body });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create budget item' });
  }
});

budgetRoutes.put('/:id', async (req, res) => {
  try {
    const item = await prisma.budgetItem.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update budget item' });
  }
});

budgetRoutes.delete('/:id', async (req, res) => {
  try {
    await prisma.budgetItem.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete budget item' });
  }
});
