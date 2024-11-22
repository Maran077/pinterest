import { IProduct } from "amazon-product-scrapper";
import { getPostDetails, PostDetails, searchProduct } from "./amazon";
import { category, tweetTemplates } from "./constents";
import { downloadAllPostImages, downloadImage } from "./utilities";

let postDetails: IProduct[] = [];
let searchWordCatgory = 3;
let tweetTemplatesIndex = 2;

type Res = {
  success: boolean;
  message: string;
};
async function main() {
  const result: Res = {
    message: "something is wrongg",
    success: false,
  };
  if (!postDetails.length) {
    const { message, posts, success } = await getPostDetails(
      category[searchWordCatgory]
    );
    if (!success || !posts.length) {
      result.message = message;
      return result;
    }
    postDetails = posts;
  }
  if (!postDetails.length) {
    result.message = "No products was found";
    return result;
  }
  const tweetTemplate = tweetTemplates[tweetTemplatesIndex];
  const post = postDetails.pop();
  if (!post) {
    result.message = "post not found";
    result.success = true;
    return result;
  }
  const image = post.images[post.images.length - 1];
  const { success, fileName } = await downloadImage(image);
  if (!success) {
    result.message = "image not found";
    return result;
  }
  console.log(post);

  return result;
}
async function name() {
  const r = await main();
  console.log(r);
}
name();
