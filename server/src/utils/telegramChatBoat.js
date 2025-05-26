import axios from "axios";

export const sendTelegramMessage = async (message) => {
  const url = `https://api.telegram.org/bot${process.env.TELEGRAM_CHAT_ID}:${process.env.TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${process.env.CHAT_ID}&text=${message}`;
  try {
    const res = await axios.get(url);
  } catch (error) {
    console.error("Telegram API Error:", error.response?.data || error.message);
  }
};
