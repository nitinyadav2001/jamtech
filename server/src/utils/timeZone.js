// utils/timezone.js

export const toIST = (date = new Date()) => {
  const istOffset = 330; // IST is UTC +5:30, or 330 minutes
  const localTime = new Date(date);
  const utcTime = new Date(
    localTime.getTime() + localTime.getTimezoneOffset() * 60000
  );
  const istTime = new Date(utcTime.getTime() + istOffset * 60000);
  return istTime;
};
