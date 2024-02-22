const PostModal = require("../Modal/post_modal");
const uploadfile = (req, res) => {
  console.log(req.file);

  if (!req.file) {
    return res.status(400).json({ error: error.message });
  }
  return res.status(201).json({ filename: req.file.filename });

  // console.log(req.file.filename);
  // return res.status(200).json({ message: "File uploaded successfully" });
};

const downloadfile = (req, res) => {
  const { filename } = req.params;
  // the below is the path where the file is stored
  const path = "./Downloads/"; // this is the path (preicsely name of the Folder containing the files), ./ means current directory in which server.js file is there
  res.download(path + filename, (error) => {
    if (error) {
      res.status(500).json({ message: "file cannot be downloaded" + error });
    }
  });
};

module.exports = { uploadfile, downloadfile };
