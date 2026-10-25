import { failureResponse } from "../utils/response.js";

const notFound = (req, res) => failureResponse(res, "Route not found", 404);

export default notFound;
