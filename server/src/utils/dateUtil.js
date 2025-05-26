// // utils/dateUtils.js
// export const convertToUTC = (date) => {
//     if (!date) return null;
//     const d = new Date(date);
//     return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString();
// };
//For Date range filteration apply only this function............................................
export const getTodayUTCDate = (startDate) => {
  const today = new Date(startDate);
  today.setUTCHours(0, 0, 0, 0);
  return today;
};
//For Date range filteration apply only this function............................................
export const getEndOfDayUTCDate = (endDate) => {
  const today = new Date(endDate);
  today.setUTCHours(23, 59, 59, 999);
  return today;
};

// utils/dateUtils.js

// start to calculate indian time here............................................
const IST_OFFSET = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30

export const convertToUTC = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString();
};

// Get today's start time in IST and convert to UTC
export const getTodayUTC = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  //   const dateS = new Date(today.getTime() - IST_OFFSET).toISOString();
  //   console.log("dateS=", dateS);
  return today.toISOString();
};

// Get today's end time in IST and convert to UTC
export const getEndOfDayUTC = () => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  //   const dateE = new Date(today.getTime() - IST_OFFSET).toISOString();
  //   console.log("dateE=", dateE);
  return today.toISOString();
};

// Calculate 24 hours ago in UTC
export const get24HoursAgoUTC = () => {
  const now = new Date();
  now.setHours(now.getHours() - 24);
  return now.toISOString();
};

// // Convert UTC date to IST
// export const convertToIST = (date) => {
//   if (!date) return null;
//   const d = new Date(date);
//   return new Date(d.getTime() + IST_OFFSET).toLocaleString("en-IN", {
//     timeZone: "Asia/Kolkata",
//   });
// };

// utils/dateUtils.js

// utils/dateUtil.js

export const getCurrentISTDate = () => {
  const now = new Date();
  const istTime = new Date(now.getTime() + IST_OFFSET);
  return istTime;
};
