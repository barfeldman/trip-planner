import { Router } from 'express';
import prisma from '../db';

export const tripRoutes = Router();

// Get all trips
tripRoutes.get('/', async (_req, res) => {
  try {
    const trips = await prisma.trip.findMany({
      include: {
        destinations: { orderBy: { sortOrder: 'asc' } },
        days: { orderBy: { dayNumber: 'asc' } },
        _count: {
          select: {
            activities: true,
            accommodations: true,
            transports: true,
          },
        },
      },
      orderBy: { startDate: 'asc' },
    });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
});

// Get single trip with all related data
tripRoutes.get('/:id', async (req, res) => {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: req.params.id },
      include: {
        destinations: { orderBy: { sortOrder: 'asc' } },
        days: {
          orderBy: { dayNumber: 'asc' },
          include: {
            activities: { orderBy: { sortOrder: 'asc' } },
            destination: true,
          },
        },
        accommodations: {
          orderBy: { checkIn: 'asc' },
          include: { destination: true },
        },
        activities: {
          orderBy: { sortOrder: 'asc' },
          include: { destination: true, day: true },
        },
        budgetItems: { orderBy: { category: 'asc' } },
        transports: { orderBy: { departureDate: 'asc' } },
        packingItems: { orderBy: { category: 'asc' } },
        documents: { orderBy: { createdAt: 'desc' } },
        notes: { orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }] },
      },
    });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    res.json(trip);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trip' });
  }
});

// Create trip
tripRoutes.post('/', async (req, res) => {
  try {
    const trip = await prisma.trip.create({
      data: req.body,
    });
    res.status(201).json(trip);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create trip' });
  }
});

// Update trip
tripRoutes.put('/:id', async (req, res) => {
  try {
    const trip = await prisma.trip.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(trip);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update trip' });
  }
});

// Delete trip
tripRoutes.delete('/:id', async (req, res) => {
  try {
    await prisma.trip.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete trip' });
  }
});
