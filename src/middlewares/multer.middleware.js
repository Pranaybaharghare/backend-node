import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
  
 const upload = multer({ storage: storage }).fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'cover', maxCount: 1 },

]);
 export {upload};