import axios from "axios";
import { addDays, formatISO } from "date-fns";

export const scheduleNotifications = (
  startDate,
  daysInterval,
  totalDurationInMonths,
  client,
  staffEmail
) => {
  const totalDurationInDays = totalDurationInMonths * 30; // Rough approximation
  const notifications = [];
  let currentDate = startDate;

  while (totalDurationInDays >= 0) {
    const formattedDate = formatISO(currentDate);
    sendNotification(client, formattedDate);

    // Schedule next notification
    currentDate = addDays(currentDate, daysInterval);
    totalDurationInDays -= daysInterval;
  }
};

export const sendNotification = async (client, date, staffEmail) => {
  try {
    const oneSignalRes = await axios.post(
      "https://api.onesignal.com/notifications",
      {
        app_id: process.env.ONESIGNAL_APP_ID,
        name: "Payment Due",
        headings: { en: "PAYMENT" },
        contents: {
          en: `Payment of ${client} is due on ${date}.`,
        },
        send_after: date,
        target_channel: "push",
        // include_player_ids: [newDisposition.lead.user.email],
        include_aliases: {
          external_id: [staffEmail],
        },
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Basic ${process.env.ONESIGNAL_API_KEY}`,
          Accept: "application/json",
        },
      }
    );

    return oneSignalRes;
  } catch (error) {
    console.error(error);
  }
};
