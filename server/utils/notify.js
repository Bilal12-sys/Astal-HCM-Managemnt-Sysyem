import Notification from "../models/notification.model.js";

export const createNotification = ({ userId, message, type }) =>
  Notification.create({ userId, message, type });
