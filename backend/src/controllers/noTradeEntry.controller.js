const NoTradeEntry = require("../models/noTradeEntry.model");

async function getEntries(req, res) {
  try {
    const userId = req.userId;

    const entries = await NoTradeEntry.find({ userId }).sort({
      createdAt: -1,
    });

    return res.status(200).json(entries);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function getEntry(req, res) {
  try {
    const userId = req.userId;
    const entryId = req.params.id;
    const entry = await NoTradeEntry.findById(entryId);

    if (!entry) {
      return res.status(404).json({ message: "Entry not found." });
    }

    if (entry.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You don't have permission to view this entry." });
    }

    return res.status(200).json(entry);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function createEntry(req, res) {
  try {
    const userId = req.userId;
    const { date, notes } = req.body;

    const newEntry = new NoTradeEntry({
      userId: userId,
      date: date,
      notes: notes,
    });

    const savedNewEntry = await newEntry.save();

    return res.status(201).json(savedNewEntry);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function updateEntry(req, res) {
  try {
    const userId = req.userId;
    const entryId = req.params.id;
    const { date, notes } = req.body;

    const entry = await NoTradeEntry.findById(entryId);

    if (!entry) {
      return res.status(404).json({ message: "Entry not found." });
    }

    if (entry.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You don't have permission to update this entry." });
    }

    if (notes !== undefined) entry.notes = notes;
    if (date !== undefined) entry.date = date;

    const savedUpdatedEntry = await entry.save();

    return res.status(200).json(savedUpdatedEntry);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function deleteEntry(req, res) {
  try {
    const userId = req.userId;
    const entryId = req.params.id;
    const entry = await NoTradeEntry.findById(entryId);

    if (!entry) {
      return res.status(404).json({ message: "Entry not found." });
    }

    if (entry.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You don't have permission to delete this entry." });
    }

    await NoTradeEntry.findByIdAndDelete(entryId);

    return res.status(200).json({ message: "Entry was successfully deleted." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

module.exports = {
  getEntries,
  getEntry,
  createEntry,
  updateEntry,
  deleteEntry,
};
