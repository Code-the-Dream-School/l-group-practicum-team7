const createEntry = (req, res) => {
  try {
    const { stress, mood, sleepHours, energy, workload } = req.body;

    if (
      stress === undefined ||
      mood === undefined ||
      sleepHours === undefined ||
      energy === undefined ||
      workload === undefined
    ) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const data = {
      stress,
      mood,
      sleepHours,
      energy,
      workload,
    };

    console.log("Received Daily log from Frontend", data);

    return res.status(201).json({
      message: "Entry created successfully",
      data,
    });
  } catch (error) {
    console.error("Error creating entry:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = { createEntry };