import {
  AmazonSearch,
  IProduct,
  IProductSearch,
} from "amazon-product-scrapper";
import { downloadImage } from "./utilities";

export const searchProduct = async (
  product: string
): Promise<IProductSearch | null> => {
  const amazon = new AmazonSearch("https://www.amazon.in/");
  const products = await amazon.search(product);
  return products;
};

export type PostDetails = {
  title: string;
  // image: string;
  url: string;
};

type GetPostDetails = {
  success: boolean;
  message: string;
  posts: IProduct[];
};

export const getPostDetails = async (
  search: string
): Promise<GetPostDetails> => {
  const result: GetPostDetails = {
    message: "something is wronge",
    success: false,
    posts: [],
  };
  const searchProducts = await searchProduct(search + " for woman");
  // console.log("Hello World", searchProducts?.url);
  const products = searchProducts?.products;

  if (!products) {
    result.message = "No products was found";
    return result;
  }

  // const len = products.length > 10 ? 10 : products.length || 0;

  if (!products.length) {
    result.message = "No products was found";
    return result;
  }
  result.success = true;
  result.posts = products.slice(0, 2);
  // for (let index = 0; index < len; index++) {
  //   const element = products[index];
  //   const { fileName, success, url } = await downloadImage(
  //     element?.image || ""
  //   );
  //   if (success) {
  //     result.posts.push({
  //       title: element?.title || "",
  //       image: fileName,
  //       url,
  //     });
  //   }
  // }

  return result;
};
