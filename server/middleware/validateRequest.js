export const validateRequest = (schema, source = "body") => async (req, res, next) => {
  try {
    const data = await schema.parseAsync(req[source]);
    req.validated = req.validated || {};
    req.validated[source] = data;
    return next();
  } catch (err) {
    return res.status(400).json({
      message: "Invalid input",
      error: true,
      success: false,
      details: err.errors?.map((e) => e.message) ?? [],
    });
  }
};