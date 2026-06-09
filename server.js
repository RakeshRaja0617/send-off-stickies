require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve the frontend from the 'public' directory

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/farewell_wall';
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Wish Schema & Model
const wishSchema = new mongoose.Schema({
  text: { type: String, required: true },
  author: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Wish = mongoose.model('Wish', wishSchema);

// --- APIs ---

// 1. Fetch Wishes API
app.get('/api/wishes', async (req, res) => {
  try {
    const wishes = await Wish.find().sort({ createdAt: 1 });
    res.json(wishes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching wishes', error: error.message });
  }
});

// 2. Save Wish API
app.post('/api/wishes', async (req, res) => {
  try {
    const { text, author } = req.body;
    if (!text || !author) {
      return res.status(400).json({ message: 'Text and author are required' });
    }
    const newWish = new Wish({ text, author });
    const savedWish = await newWish.save();
    res.status(201).json({ message: 'Wish saved successfully', wish: savedWish });
  } catch (error) {
    res.status(500).json({ message: 'Error saving wish', error: error.message });
  }
});

// 3. Edit Wish API
app.put('/api/wishes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'Text is required for update' });
    }

    const updatedWish = await Wish.findByIdAndUpdate(
      id,
      { text },
      { new: true }
    );

    if (!updatedWish) {
      return res.status(404).json({ message: 'Wish not found' });
    }

    res.json({ message: 'Wish updated successfully', wish: updatedWish });
  } catch (error) {
    res.status(500).json({ message: 'Error updating wish', error: error.message });
  }
});

// 4. Delete Wish API
app.delete('/api/wishes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedWish = await Wish.findByIdAndDelete(id);
    
    if (!deletedWish) {
      return res.status(404).json({ message: 'Wish not found' });
    }

    res.json({ message: 'Wish deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting wish', error: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
