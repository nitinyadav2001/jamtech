// Function to check if a given date is within office hours (between 10:00 AM to 6:30 PM) and not Sunday
// Code review:
// - Constants are correctly defined with descriptive names
// - OFFICE_END_HOUR correctly represents 6:30 PM as 18.5 in 24-hour format
// - getDay() correctly checks for Sunday (0) and Saturday (6)
// - Decimal hour calculation is correct: hours + minutes/60
// - Logic checks for non-weekend days and time within office hours
// - Export statement is correctly used
const OFFICE_START_HOUR = 10; // 10:00 AM
const OFFICE_END_HOUR = 18.5; // 6:30 PM (in 24-hour format)

export const isOfficeHour = (date) => {
  const day = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const hour = date.getHours();
  const minute = date.getMinutes();
  const decimalHour = hour + minute / 60; // Convert hours + minutes into a decimal

  return (
    day !== 0 &&
    day !== 6 && // Changed from 7 to 6 since days are 0-6
    decimalHour >= OFFICE_START_HOUR &&
    decimalHour <= OFFICE_END_HOUR
  );
};
