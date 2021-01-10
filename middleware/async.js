module.exports = function(reqHandler) {
  return async (req, res, next) => {
    try {
      await reqHandler(req, res);
    } catch (ex) {
      next(ex);
    }
  };
};