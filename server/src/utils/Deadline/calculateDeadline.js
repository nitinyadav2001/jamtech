export const calculateDeadlineBasedOnWorkingHours = (
  startDate,
  totalMinutes
) => {
  const WORK_DAY_MINUTES = 450; // 7.5 hours per day
  let currentDate = new Date(startDate);
  let remainingMinutes = totalMinutes;

  while (remainingMinutes > 0) {
    if (currentDate.getDay() !== 0) {
      // Not Sunday
      const todayMinutes = Math.min(WORK_DAY_MINUTES, remainingMinutes);
      remainingMinutes -= todayMinutes;

      if (remainingMinutes <= 0) {
        const workStart = new Date(currentDate.setHours(10, 0, 0, 0));
        return new Date(workStart.getTime() + todayMinutes * 60 * 1000);
      }
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return currentDate;
};
