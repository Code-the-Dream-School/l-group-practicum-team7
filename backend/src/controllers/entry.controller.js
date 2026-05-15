const Entry = require("../models/Entry");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");
const { getSleepScore, calculateBurnout } = require("../services/burnout");

// CREATE
const createEntry = async (req, res) => {
  const { stress, workload, sleepHours, energy } = req.body;
  const userId = req.user.userId;

  if (
    stress == null ||
    workload == null ||
    sleepHours == null ||
    energy == null ||
    stress < 1 ||
    stress > 5 ||
    workload < 1 ||
    workload > 5 ||
    energy < 1 ||
    energy > 5 ||
    sleepHours < 0 ||
    sleepHours > 24
  ) {
    throw new BadRequestError("Invalid input values. stress, workload, and energy must be from 1 to 5. sleepHours must be from 0 to 24.");
  }

  const normalizedSleep = Math.min(Number(sleepHours), 8);
  const sleepScore = getSleepScore(normalizedSleep);

  const { score, level } = calculateBurnout({
    stress,
    workload,
    sleepScore,
    energy,
  });

  const entry = await Entry.create({
    userId,
    stress,
    workload,
    sleepHours,
    sleepScore,
    energy,
    burnoutScore: score,
    burnoutLevel: level,
    date: new Date(),
  });

  res.status(StatusCodes.CREATED).json(entry);
};

// READ ALL
const getEntries = async (req, res) => {
  const userId = req.user.userId;

  const entries = await Entry.find({ userId }).sort({ date: -1 });

  res.status(StatusCodes.OK).json(entries);
};

// READ ONE
const getEntryById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  const entry = await Entry.findOne({ _id: id, userId });

  if (!entry) {
    throw new NotFoundError("Entry not found");
  }

  res.status(StatusCodes.OK).json(entry);
};

// UPDATE
const updateEntry = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const { stress, workload, sleepHours, energy } = req.body;

  if (
    stress == null ||
    workload == null ||
    sleepHours == null ||
    energy == null ||
    stress < 1 ||
    stress > 5 ||
    workload < 1 ||
    workload > 5 ||
    energy < 1 ||
    energy > 5
  ) {
    throw new BadRequestError("Invalid input values");
  }

  const normalizedSleep = Math.min(Number(sleepHours), 8);
  const sleepScore = getSleepScore(normalizedSleep);

  const { score, level } = calculateBurnout({
    stress,
    workload,
    sleepScore,
    energy,
  });

  const updated = await Entry.findOneAndUpdate(
    { _id: id, userId },
    {
      stress,
      workload,
      sleepHours,
      sleepScore,
      energy,
      burnoutScore: score,
      burnoutLevel: level,
    },
    { new: true, runValidators: true },
  );
  if (!updated) {
    throw new NotFoundError("Entry not found");
  }

  res.status(StatusCodes.OK).json(updated);
};

// DELETE
const deleteEntry = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  const deleted = await Entry.findOneAndDelete({ _id: id, userId });

  if (!deleted) {
    throw new NotFoundError("Entry not found");
  }

  res.status(StatusCodes.OK).json({ message: "Entry deleted" });
};

module.exports = {
  createEntry,
  getEntries,
  getEntryById,
  updateEntry,
  deleteEntry,
};