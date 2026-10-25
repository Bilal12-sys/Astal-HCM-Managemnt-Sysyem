import { getPktDayName, isIsoDate } from "./time.js";

export const getWorkingDays = (startDate, endDate, weekend = ["Sat", "Sun"], holidays = []) => {
  if (!isIsoDate(startDate) || !isIsoDate(endDate) || endDate < startDate) {
    throw new TypeError("startDate and endDate must be valid ordered YYYY-MM-DD dates");
  }

  const weekendDays = new Set(weekend);
  const holidayDates = new Set(holidays);
  const days = [];

  for (
    let date = new Date(`${startDate}T12:00:00.000Z`);
    date <= new Date(`${endDate}T12:00:00.000Z`);
    date.setUTCDate(date.getUTCDate() + 1)
  ) {
    const dateString = date.toISOString().slice(0, 10);

    if (!weekendDays.has(getPktDayName(dateString)) && !holidayDates.has(dateString)) {
      days.push(dateString);
    }
  }

  return days;
};

export const countWorkingDays = (...args) => getWorkingDays(...args).length;
