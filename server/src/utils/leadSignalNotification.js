import axios from "axios";
import prisma from "../config/prismaClient.js";
export const sendLeadNotification = async (
  mappedLead,
  assignedSalesperson,
  project,
  allEmails
) => {
  try {
    const findUser = await prisma.user.findFirst({
      where: {
        email: assignedSalesperson.email,
      },
      select: {
        notificationSound: true,
      },
    });
    console.log("findUser==", findUser.notificationSound);
    const notificationResponse = await axios.post(
      "https://api.onesignal.com/notifications",
      {
        app_id: process.env.ONESIGNAL_APP_ID,
        name: "New Lead",
        headings: { en: `Fresh Lead\nProject: ${project}` },
        contents: {
          en: `Name: ${mappedLead.name}\nPhone: ${mappedLead.phoneNo1}`,
        },
        large_icon:
          "https://images.crunchbase.com/image/upload/c_pad,f_auto,q_auto:eco,dpr_1/vyrl4qsctcw60aaxxjq1",
        small_icon: "ic_stat_onesignal_default",
        android_sound: findUser.notificationSound,
        target_channel: "push",
        include_aliases: {
          external_id: [
            "abhi241092@gmail.com",
            "akash.saxena032@gmail.com",
            "sameeksha310803@gmail.com",
            "aditya.wirewings@gmail.com",
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

    console.log("Notification Response:", notificationResponse.data);
  } catch (error) {
    console.error("Notification Error:", error.response?.data || error.message);
  }
};

export const scheduleNotification = async (newDisposition) => {
  try {
    console.log("newDisposition==", newDisposition.notificationSound);

    const onesignal = await axios.post(
      "https://api.onesignal.com/notifications",
      {
        app_id: process.env.ONESIGNAL_APP_ID,
        name: "Follow UP",
        headings: {
          en: `Follow Up\n${newDisposition.lead.name} | ${
            newDisposition.dispositionType.name
          } | ${new Date(newDisposition.followUpDate).toString()}`,
        },
        contents: {
          en: `${newDisposition.notes || "NA"}`,
        },
        data: { phone: newDisposition.lead.phone },
        send_after: new Date(newDisposition.followUpDate).toISOString(),
        target_channel: "push",
        include_aliases: {
          external_id: [newDisposition.salesperson.email],
        },
        large_icon:
          "https://images.crunchbase.com/image/upload/c_pad,f_auto,q_auto:eco,dpr_1/vyrl4qsctcw60aaxxjq1",
        small_icon: "ic_stat_onesignal_default",
        android_sound: newDisposition.notificationSound,
        // android_channel_id: "806b464b-7187-44a5-a19c-39c836ee2f45",
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Basic ${process.env.ONESIGNAL_API_KEY}`,
          Accept: "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Notification Error:", error.response?.data || error.message);
  }
};
