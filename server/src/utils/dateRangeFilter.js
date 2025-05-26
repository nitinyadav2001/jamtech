export const dateRangeFilter = (period) => {
  let periodStartDate = null;

  const now = new Date();

  switch (period) {
    case "today":
      periodStartDate = new Date();
      periodStartDate.setHours(0, 0, 0, 0);
      break;

    case "yesterday":
      periodStartDate = new Date();
      periodStartDate.setDate(now.getDate() - 1);
      periodStartDate.setHours(0, 0, 0, 0);
      break;

    case "thisWeek":
      periodStartDate = new Date();
      const dayOfWeek = periodStartDate.getDay(); // 0 (Sun) to 6 (Sat)
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      periodStartDate.setDate(now.getDate() + diffToMonday);
      periodStartDate.setHours(0, 0, 0, 0);
      break;

    case "lastWeek":
      periodStartDate = new Date();
      const currentDay = periodStartDate.getDay(); // 0 (Sun) to 6 (Sat)
      const startOfThisWeekOffset = currentDay === 0 ? -6 : 1 - currentDay;
      const startOfThisWeek = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + startOfThisWeekOffset
      );
      periodStartDate = new Date(startOfThisWeek);
      periodStartDate.setDate(periodStartDate.getDate() - 7);
      periodStartDate.setHours(0, 0, 0, 0);
      break;

    case "thisMonth":
      periodStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
      periodStartDate.setHours(0, 0, 0, 0);
      break;

    case "lastMonth":
      periodStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      periodStartDate.setHours(0, 0, 0, 0);
      break;

    case "oneWeek":
      periodStartDate = new Date();
      periodStartDate.setDate(now.getDate() - 7);
      break;

    case "twoWeeks":
      periodStartDate = new Date();
      periodStartDate.setDate(now.getDate() - 14);
      break;

    case "oneMonth":
      periodStartDate = new Date();
      periodStartDate.setMonth(now.getMonth() - 1);
      break;

    case "threeMonth":
      periodStartDate = new Date();
      periodStartDate.setMonth(now.getMonth() - 3);
      break;

    case "sixMonth":
      periodStartDate = new Date();
      periodStartDate.setMonth(now.getMonth() - 6);
      break;

    case "thisYear":
      periodStartDate = new Date(now.getFullYear(), 0, 1);
      periodStartDate.setHours(0, 0, 0, 0);
      break;

    default:
      periodStartDate = null;
  }

  return periodStartDate;
};
