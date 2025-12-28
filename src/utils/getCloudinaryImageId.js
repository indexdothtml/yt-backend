function getCloudinaryImageId(cloudinaryImageURL) {
  if (!cloudinaryImageURL) {
    return null;
  }

  const splittedImageURL = cloudinaryImageURL.split("/");
  const fileName = splittedImageURL[splittedImageURL.length - 1];
  return fileName.split(".")[0];
}

export { getCloudinaryImageId };
