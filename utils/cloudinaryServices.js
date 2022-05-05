//Cloudinary SDK
require("dotenv").config();
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

cloudinaryUpload = (file) =>
  cloudinary.uploader.upload(file, {
    upload_preset: process.env.UPLOAD_PRESET,
  });

//get images by search api, sort_by working with folder
searchImages = async (next_cursor) => {
  const resources = await cloudinary.search
    .expression(`folder:${process.env.UPLOAD_FOLDER}`)
    .max_results(20)
    .sort_by("uploaded_at", "desc")
    .next_cursor(next_cursor)
    .execute();
  return resources;
};

//get all images, sort_by not working with prefix/folder
getImages = async (next_cursor) => {
  const results = {
    images: [],
    next_cursor: null,
  };

  try {
    const response = await cloudinary.api.resources({
      type: "upload",
      prefix: "agirlpic",
      max_results: 20,
      next_cursor: next_cursor,
    });

    if (response) {
      let rawResults = [];
      response.resources.forEach((item) => {
        rawResults.push({
          public_id: item.public_id,
          created_at: item.created_at,
          secure_url: item.secure_url,
        });
      });

      //Sort by created_at
      //https://stackoverflow.com/questions/8837454/sort-array-of-objects-by-single-key-with-date-value
      results.images = rawResults.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      if (response.next_cursor) {
        results.next_cursor = response.next_cursor;
      }
    }

    return response;
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports = {
  cloudinaryUpload,
  getImages,
  searchImages,
};
