import * as https from "https";
import * as fs from "fs";
import * as path from "path";
import { IProduct } from "amazon-product-scrapper";

/**
 * Downloads an image from the specified URL and saves it in the current working directory.
 * @param url - The URL of the image to download.
 * @returns A Promise that resolves to the file name once the image is downloaded.
 */

export type ImageStatus = {
  success: boolean;
  fileName: string;
  url: string;
};

function downloadImageToCurrentFolder(url: string): Promise<ImageStatus> {
  return new Promise((resolve, reject) => {
    const fileName = path.basename(url); // Extract the file name from the URL
    const filePath = path.join(process.cwd(), fileName); // Use the current working directory

    const file = fs.createWriteStream(filePath);

    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(
            new Error(
              `Failed to get image. Status code: ${response.statusCode}`
            )
          );
          return;
        }

        response.pipe(file);

        file.on("finish", () => {
          file.close(() => resolve({ success: true, fileName, url }));
        });
      })
      .on("error", (err) => {
        fs.unlink(filePath, () => reject({ success: false, fileName, url })); // Delete the file on error
      });
  });
}

// Usage example:
const imageUrl: string =
  "https://m.media-amazon.com/images/I/61PIAyOPNaL._AC_UL320_.jpg";

//   .then((fileName: string) => {
//     console.log(`Image downloaded successfully: ${fileName}`);
//   })
//   .catch((err: Error) => {
//     console.error('Error downloading image:', err);
//   });

export const downloadImage = async (url: string): Promise<ImageStatus> => {
  if (!url) return { success: false, fileName: "", url: "" };
  const res = await downloadImageToCurrentFolder(url);
  return res;
};

export type AllImage = {
  success: boolean;
  path: string[];
  message: string;
};

export const downloadAllPostImages = async (
  post: IProduct
): Promise<AllImage> => {
  const result: AllImage = { success: false, path: [], message: "" };
  const images = post.images;
  for (let index = 0; index < images.length; index++) {
    const image = images[index];
    const { fileName, success, url } = await downloadImage(image || "");
    if (success) {
      result.path.push(fileName);
    }
  }
  result.success = true;
  return result;
};

interface DeleteResult {
  success: boolean;
  message: string;
}

export function deleteImage(fileName: string): Promise<DeleteResult> {
  return new Promise((resolve) => {
    const filePath = path.join(process.cwd(), fileName); // File path in the current directory

    fs.unlink(filePath, (err) => {
      if (err) {
        if (err.code === "ENOENT") {
          resolve({
            success: false,
            message: `File not found: ${fileName}`,
          });
        } else {
          resolve({
            success: false,
            message: `Error deleting file`,
          });
        }
      } else {
        resolve({
          success: true,
          message: `File deleted successfully: ${fileName}`,
        });
      }
    });
  });
}

export const convertLink = (link: string): string => {
  const convertedLink = `${link}?th=1&psc=1&linkCode=ll1&tag=brightnest-21&linkId=2df1021b622e3dd095315c1120c36a15&language=en_IN&ref_=as_li_ss_tl`;
  return convertedLink;
};
