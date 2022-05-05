//https://stackoverflow.com/questions/61716903/getting-req-body-empty-using-form-data-in-postman
//https://stackoverflow.com/questions/25143525/can-we-configure-multer-to-not-store-files-locally-and-only-for-using-req-files
/*
Tại đây có 2 cách dùng multer: dùng inMemory để lưu file trên Ram, sau đó phải dùng stream để upload (?)
https://codeburst.io/image-upload-with-cloudinary-part-2-next-react-node-js-198108f672e5
Cách 2 là dùng fs sau khi upload thì xoá file

*/
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const { upload } = require("./utils/multerServices");
const {
  cloudinaryUpload,
  getImages,
  searchImages,
} = require("./utils/cloudinaryServices");
const { formatBuffer } = require("./utils/datauriServices");

//Check base64 image
// const base64regex =
//   /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
const base64ImageCheck = (file) => file.includes("base64");

const singleUpload = upload.single("file");
const singleUploadCtrl = (req, res, next) => {
  singleUpload(req, res, (error) => {
    if (error) {
      return res.status(422).send({
        message: "Image upload failed",
      });
    }
    next();
  });
};

// Get images
app.get("/api/photos/all", async (req, res) => {
  const results = await getImages();
  return res.json({
    results: results,
  });
});

app.get("/api/photos", async (req, res) => {
  //axios truyen params thong qua res.query
  const response = await searchImages(req.query.next_cursor || "");
  const results = {
    images: [],
    next_cursor: null,
  };
  response.resources.forEach((item) => {
    results.images.push({
      public_id: item.public_id,
      created_at: item.created_at,
      secure_url: item.secure_url,
    });
  });
  if (response.next_cursor) {
    results.next_cursor = response.next_cursor;
  }
  return res.json({
    results,
  });
});

//Upload image

app.post("/api/upload", singleUploadCtrl, async (req, res) => {
  //axios se co request la req.body
  const uploadFile = req.body.file || req.file;
  console.log(uploadFile);
  try {
    if (!uploadFile) {
      return res.status(422).send({
        message: "There are error in uploading",
      });
    }

    // Chuyen file dang buffer sang base64
    let uploadResult;
    if (!uploadFile.buffer) {
      uploadResult = await cloudinaryUpload(uploadFile);
    } else {
      let file64 = formatBuffer(uploadFile);
      uploadResult = await cloudinaryUpload(file64.content);
    }

    return res.json({
      cloudinaryId: uploadResult.public_id,
      url: uploadResult.secure_url,
      message: "upload OK",
    });
  } catch (err) {
    return res.status(422).send({
      message: err.message,
    });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log("Port is running on", process.env.PORT);
});
