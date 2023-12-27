/**
 * Get a Date object representing a specified number of days ago from today.
 * Useful for Prisma queries.
 */
function getDateForDaysAgo(daysAgo: number): Date {
  const today = new Date();
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() - daysAgo);
  return targetDate;
}

export default getDateForDaysAgo;
