const createEntry = (req, res) => {
  const data = req.body;
  console.log("Received Daily log from Frontend", data);
  return res.status(201).json({ message: "Entry created successfully", data });
};
module.exports = { createEntry };
