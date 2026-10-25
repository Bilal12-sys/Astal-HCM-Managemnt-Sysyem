export const successResponse = (res, data, status = 200, meta) => {
  const response = { success: true, data };

  if (meta) {
    response.meta = meta;
  }

  return res.status(status).json(response);
};

export const failureResponse = (res, message, status = 500, errors, code) => {
  const response = { success: false, message };

  if (errors) {
    response.errors = errors;
  }

  if (code) {
    response.code = code;
  }

  return res.status(status).json(response);
};
