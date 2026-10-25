const PKT_TIME_ZONE = "Asia/Karachi";

export const getPktDate = (date = new Date()) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: PKT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

export const getPktTime = (date = new Date()) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: PKT_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);

export const isIsoDate = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};

export const isIsoMonth = (value) =>
  typeof value === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);

export const getPktDayName = (date) => {
  if (!isIsoDate(date)) {
    throw new TypeError("date must be a valid YYYY-MM-DD string");
  }

  return new Intl.DateTimeFormat("en-US", {
    timeZone: PKT_TIME_ZONE,
    weekday: "short",
  }).format(new Date(`${date}T12:00:00.000Z`));
};

export { PKT_TIME_ZONE };
