const {
  DIALOGUES,
  getAvailableDialoguesForUser,
  getUnlockedToolsForUser,
  unlockToolForUser,
} = require("../services/dialogueService");

function getUserId(req) {
  return req.user?.userId || req.user?.id || req.user?._id || req.userId;
}

async function getAllDialogues(req, res) {
  return res.json({
    dialogues: DIALOGUES,
  });
}

async function getAvailableDialogues(req, res) {
  const userId = getUserId(req);

  if (!userId) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  const result = await getAvailableDialoguesForUser(userId);

  return res.json(result);
}

async function getUnlockedTools(req, res) {
  const userId = getUserId(req);

  if (!userId) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  const tools = await getUnlockedToolsForUser(userId);

  return res.json({
    tools,
  });
}

async function unlockTool(req, res) {
  const userId = getUserId(req);

  if (!userId) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  const tool = await unlockToolForUser(userId, req.body);

  return res.status(201).json({
    tool,
  });
}

module.exports = {
  getAllDialogues,
  getAvailableDialogues,
  getUnlockedTools,
  unlockTool,
};