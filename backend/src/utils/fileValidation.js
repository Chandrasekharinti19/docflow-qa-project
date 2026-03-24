const allowedExtensions = [
  "pdf",
  "docx",
  "xlsx",
  "jpg",
  "jpeg",
  "png",
  "zip",
];

function getFileExtension(fileName) {
  if (!fileName || typeof fileName !== "string" || !fileName.includes(".")) {
    return "";
  }

  return fileName.split(".").pop().toLowerCase();
}

function isValidFileType(fileName) {
  const extension = getFileExtension(fileName);
  return allowedExtensions.includes(extension);
}

module.exports = {
  allowedExtensions,
  getFileExtension,
  isValidFileType,
};