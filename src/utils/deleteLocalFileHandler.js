import fs from "node:fs";

function deleteLocalFile({
  avatarImageLocalPath = null,
  coverImageLocalPath = null,
}) {
  try {
    if (avatarImageLocalPath) {
      fs.unlinkSync(avatarImageLocalPath);
    }

    if (coverImageLocalPath) {
      fs.unlinkSync(coverImageLocalPath);
    }

    return true;
  } catch (error) {
    return false;
  }
}

export { deleteLocalFile };
