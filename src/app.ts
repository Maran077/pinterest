import { IProduct } from "amazon-product-scrapper";
import { getPostDetails, PostDetails, searchProduct } from "./amazon";
import { category, tweetTemplates } from "./constents";
import {
  convertLink,
  deleteImage,
  downloadAllPostImages,
  downloadImage,
} from "./utilities";
import { TwitterApi } from "twitter-api-v2";
import { config } from "dotenv";
import express from "express";
import { sendPhoto } from "./telegram";
config();
let postDetails: IProduct[] = [];
let searchWordCatgory = 3;
let tweetTemplatesIndex = 13;
let postIndex = 0;
let FILENAME = "";
const app = express();

type Res = {
  success: boolean;
  message: string;
};
async function main() {
  const result: Res = {
    message: "something is wrongg",
    success: false,
  };
  if (postIndex >= postDetails.length) {
    const { message, posts, success } = await getPostDetails(
      category[searchWordCatgory]
    );

    if (!success || !posts.length) {
      result.message = message;
      return result;
    }
    postDetails = posts;

    postIndex = 0;
    console.log("run");
    searchWordCatgory =
      category.length > searchWordCatgory ? searchWordCatgory + 1 : 0;
  }
  if (!postDetails.length) {
    result.message = "No products was found";
    return result;
  }
  const tweetTemplate = tweetTemplates[tweetTemplatesIndex];
  const post = postDetails[postIndex];
  if (!post) {
    result.message = "post not found";
    result.success = true;
    return result;
  }
  const image = post.images[post.images.length - 2];
  const { success: downloadSuccess, fileName } = await downloadImage(
    image || post.image
  );
  FILENAME = fileName;
  if (!downloadSuccess) {
    result.message = "image not found";
    return result;
  }
  // console.log(
  //   post,
  //   postIndex,
  //   postDetails.length,
  //   tweetTemplatesIndex,
  //   searchWordCatgory
  // );
  postIndex++;
  tweetTemplatesIndex =
    tweetTemplates.length > tweetTemplatesIndex ? tweetTemplatesIndex + 1 : 0;

  const productLink = convertLink(post.link);
  const tweet = `${tweetTemplate}:

  ${post.titles.join(" ")} 

  Buy Now:${productLink}  `;

  const appKey = process.env.APP_KEY;
  const appSecret = process.env.APP_SECRECT;
  const accessToken = process.env.ACCESS_TOKEN;
  const accessSecret = process.env.ACCESS_SECRECT;
  // console.log(appKey, appSecret, accessToken, accessSecret);

  if (!appKey || !appSecret || !accessToken || !accessSecret) {
    // console.log(
    //   "Please set the environment variables APP_KEY, APP_SECRECT, ACCESS_TOKEN, ACCESS_SECRECT"
    // );
    result.message = "Please set the environment variables";
    await deleteImage(fileName);
    return result;
  }

  const twitterClient = new TwitterApi({
    appKey,
    appSecret,
    accessSecret,
    accessToken,
  });
  const rwClient = twitterClient.readWrite;

  const mediaId = await rwClient.v1.uploadMedia(fileName);

  const tweetId = await rwClient.v2.tweetThread([
    {
      media: { media_ids: [mediaId] },
      text: tweet,
    },
  ]);
  const postId = tweetId[0].data.id;
  const url = `https://twitter.com/${process.env.TWITTER_USERNAME}/status/${postId}`;
  // console.log(tweetId[0].data.id);
  const bot = `${tweetTemplate}:

  ${post.titles.join(" ")} 

  Buy Now: ${url} `;
  const BotStatus = await sendPhoto(fileName, bot);
  if (!BotStatus.success) {
    await deleteImage(fileName);
    result.message = BotStatus.message;
    return result;
  }
  const { message, success } = await deleteImage(fileName);
  if (!success) {
    result.message = message + " " + tweet;
    return result;
  }
  result.message = tweet + " " + tweetId;
  // result.message = tweet;
  result.success = true;
  FILENAME = "";

  return result;
}
// async function name() {
//   const r = await main();
//   console.log(r);
// }
// // name();
// // name();
// // name();
// // name();

app.get("/", async (req, res) => {
  try {
    const response = await main();
    res.json(response);
  } catch (error) {
    if (FILENAME) {
      const { message, success } = await deleteImage(FILENAME);
      FILENAME = "";
    }
    console.log(error);

    res.json({ success: false, error: "error happen" });
  }
  // const message = response.success ? "ok" : "fail";
});

app.get("/test", async (req, res) => {
  res.send("test");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
