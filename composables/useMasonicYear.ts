export const useMasonicYear = () => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // getMonth() is 0-indexed

  // If month >= 9 (September or later), we’re in the new Masonic year
  const startYear = month >= 9 ? year % 100 : (year - 1) % 100;
  const endYear = (startYear + 1) % 100;

  const masonicYear = `${String(startYear).padStart(2, '0')}-${String(endYear).padStart(2, '0')}`;

  return { masonicYear };
};
