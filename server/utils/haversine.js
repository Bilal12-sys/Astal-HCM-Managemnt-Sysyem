const EARTH_RADIUS_METERS = 6371000;
const toRadians = (degrees) => (degrees * Math.PI) / 180;

export const getDistanceMeters = (lat1, lng1, lat2, lng2) => {
  const values = [lat1, lng1, lat2, lng2];

  if (values.some((value) => !Number.isFinite(value))) {
    throw new TypeError("Coordinates must be finite numbers");
  }

  const latitudeDifference = toRadians(lat2 - lat1);
  const longitudeDifference = toRadians(lng2 - lng1);
  const distance =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(longitudeDifference / 2) ** 2;

  return 2 * EARTH_RADIUS_METERS * Math.atan2(Math.sqrt(distance), Math.sqrt(1 - distance));
};
