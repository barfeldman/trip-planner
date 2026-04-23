import { Router } from 'express';
import prisma from '../db';

export const noteRoutes = Router();

noteRoutes.get('/trip/:tripId', async (req, res) => {
  try {
    const notes = await prisma.note.findMany({
      where: { tripId: req.params.tripId },
      orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
    });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

noteRoutes.post('/', async (req, res) => {
  try {
    const note = await prisma.note.create({ data: req.body });
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create note' });
  }
});

noteRoutes.put('/:id', async (req, res) => {
  try {
    const note = await prisma.note.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update note' });
  }
});

noteRoutes.delete('/:id', async (req, res) => {
  try {
    await prisma.note.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete note' });
  }
});
