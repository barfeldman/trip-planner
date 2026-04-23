import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../db';

export const documentRoutes = Router();

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${uuidv4()}-${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and image files are allowed'));
    }
  },
});

documentRoutes.get('/trip/:tripId', async (req, res) => {
  try {
    const documents = await prisma.document.findMany({
      where: { tripId: req.params.tripId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

documentRoutes.post('/', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const data: any = {
      tripId: req.body.tripId,
      name: req.body.name,
      type: req.body.type || 'other',
      notes: req.body.notes,
    };
    if (file) {
      data.fileName = file.originalname;
      data.filePath = file.filename;
      data.mimeType = file.mimetype;
      data.fileSize = file.size;
    }
    const document = await prisma.document.create({ data });
    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create document' });
  }
});

documentRoutes.put('/:id', async (req, res) => {
  try {
    const document = await prisma.document.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(document);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update document' });
  }
});

documentRoutes.delete('/:id', async (req, res) => {
  try {
    const doc = await prisma.document.findUnique({ where: { id: req.params.id } });
    if (doc?.filePath) {
      const fullPath = path.join(UPLOAD_DIR, doc.filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }
    await prisma.document.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete document' });
  }
});
