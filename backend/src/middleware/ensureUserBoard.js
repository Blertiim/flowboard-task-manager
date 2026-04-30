const { ensureUserBoardSetup } = require("../utils/boardSetup");

async function ensureUserBoard(request, _response, next) {
  try {
    await ensureUserBoardSetup(request.user._id);
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = { ensureUserBoard };
