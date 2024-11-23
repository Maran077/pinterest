import TelegramBot from "node-telegram-bot-api";
import path from "path";
import { config } from "dotenv";
config();

// Replace with your bot's token
const token: string = process.env.TELEGRAM_BOT_TOKEN || "";

// Create a bot instance
const bot = new TelegramBot(token, { polling: false });

// Replace with your channel username (e.g., @your_channel_name)
const chatId: string = "@ethnic_threads";

// Function to send a message
const sendMessage = async (message: string): Promise<void> => {
  try {
    await bot.sendMessage(chatId, message);
    console.log("Message sent successfully!");
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

export type BotStatus = { success: boolean; message: string };
// Function to send a photo
export const sendPhoto = async (
  photoPath: string,
  caption: string
): Promise<BotStatus> => {
  const result = { success: false, message: "" };
  try {
    await bot.sendPhoto(chatId, photoPath, { caption });
    console.log("Photo sent successfully!");
    result.success = true;
    result.message = "Photo sent successfully!";
    return result;
  } catch (error) {
    console.error("Error sending photo:", error);
    result.message = "Error sending photo";
    return result;
  }
};

// Example Usage
// sendMessage("Hello, Telegram Channel!");
// const fileName = path.basename("jpg(5).jpg");
// const fileName = "jpg(5).jpg";
// const filePath = path.resolve(__dirname, fileName);
// sendPhoto(filePath, "Check this out!");
