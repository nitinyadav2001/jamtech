import axios from "axios";
import prisma from "../config/prismaClient.js";
export const sendGlobalNotification = async (data) => {
  const { heading, title, message, userIds } = data;
  try {
    const response = await axios.post(
      "https://api.onesignal.com/notifications",
      {
        app_id: process.env.ONESIGNAL_APP_ID,
        name: heading,
        headings: { en: `${heading}\n${title}` },
        contents: { en: message },
        target_channel: "push",
        include_aliases: {
          external_id: userIds,
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

    console.log("Notification sent:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error sending notification:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const sendGlobalLeadNotification = async (data) => {
  const { name, email, phone, company, assignedToId } = data;

  try {
    const findUser = await prisma.user.findFirst({
      where: {
        id: assignedToId,
      },
    });

    const heading = "New Lead Created";
    const title = `${name} from ${company}`;
    const message = `A new lead has been created with the following details:
    Name: ${name}
    Email: ${email}
    Phone: ${phone}
    Company: ${company}
    Assigned: ${findUser.fullName || "N/A"}`;

    const notificationResponse = await axios.post(
      "https://api.onesignal.com/notifications",
      {
        app_id: process.env.ONESIGNAL_APP_ID,
        name: heading,
        headings: { en: `${heading}\n${title}` },
        contents: { en: message },
        large_icon:
          "https://images.crunchbase.com/image/upload/c_pad,f_auto,q_auto:eco,dpr_1/vyrl4qsctcw60aaxxjq1",
        small_icon: "ic_stat_onesignal_default",
        target_channel: "push",
        include_aliases: {
          external_id: [
            "wirewingsweb@gmail.com",
            "abhi241092@gmail.com",
            "sameeksha310803@gmail.com",
            `${findUser.email}`,
          ],
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

    console.log("Lead notification sent:", notificationResponse);
  } catch (error) {
    console.error(
      "Error sending lead notification:",
      error.response?.data || error.message
    );
    throw error;
  }
};
