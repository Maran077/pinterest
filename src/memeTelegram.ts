import snoowrap from "snoowrap";
import https from "https";
import fs from "fs";
import { config } from "dotenv";

config();

const reddit = new snoowrap({
  userAgent: process.env.USER_AGENT || "",
  clientId: process.env.CLIENT_ID || "",
  clientSecret: process.env.CLIENT_SECRET || "",
  username: process.env.USER_NAME || "",
  password: process.env.PASSWORD || "",
});
type getRedditPostResult = {
  success: boolean;
  imageUrl: string;
  text: string;
  message: string;
};
export const getRedditPost = async (
  subreddit: string
): Promise<getRedditPostResult> => {
  const result: getRedditPostResult = {
    success: false,
    imageUrl: "",
    text: "",
    message: "",
  };

  return reddit
    .getSubreddit(subreddit)
    .getNew({ limit: 1 })
    .then((posts) => {
      if (posts.length > 0) {
        const post = posts[0];
        const imageUrl = post.url; // Get the image URL from the post
        const text = post.title;
        result.imageUrl = imageUrl;
        result.text = text;
        result.success = true;
        result.message = "Image found in the post.";
        return result;
      } else {
        result.message = "No image found in the post.";
        return result;
      }
    });
};
