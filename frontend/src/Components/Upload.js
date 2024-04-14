import React from "react";
import md5 from "js-md5";


/**
 * SelectFileButton component allows the user to select a file and handles the file selection event.
 */
const SelectFileButton = ({ setFile, setFileId }) => {
  const fileChangedHandler = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    const image = new Image();
    image.src = URL.createObjectURL(file);

    // avoid selecting fake .png files
    try {
      await image.decode();
      setFile(file);
    } catch (error) {
      window.alert("Please provide a valid image to upload.");
      setFile(null);
    } finally {
      URL.revokeObjectURL(image.src);
      setFileId("");
    }
  };

  return <input type="file" accept="image/png" onChange={fileChangedHandler} />;
};

/**
 * Reads the contents of a file as an ArrayBuffer.
 *
 * @param {File} file - The file to read.
 * @returns {Promise<ArrayBuffer>} A promise that resolves with the file's contents as an ArrayBuffer.
 */
const readFileBuffer = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      resolve(event.target.result);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });

/**
 * Reads the dimensions of an image file.
 * @param {File} file - The image file to read.
 * @returns {Promise<{width: number, height: number}>} - A promise that resolves to an object containing the width and height of the image.
 */
const readImageDimensions = async (file) => {
  const image = new Image();
  try {
    image.src = URL.createObjectURL(file);
    await image.decode();
    return { width: image.width, height: image.height };
  } finally {
    URL.revokeObjectURL(image.src);
  }
};

/**
 * Retrieves a presigned URL for uploading an image.
 *
 * @param {string} hash - The hash of the image.
 * @param {string} dimensions - The dimensions of the image.
 * @param {string} description - The description of the image.
 * @returns {Promise<Object>} - A promise that resolves to the presigned URL.
 * @throws {Error} - If fetching the presigned URL fails.
 */
const getPresignedUrl = async (hash, dimensions, description) => {
  const response = await fetch("/api/v1/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ hash, description, dimensions }),
  });
  if (!response.ok) {
    throw new Error("Fetch presigned url failed.");
  }
  return await response.json();
};

/**
 * Uploads a file to a specified URL using FormData.
 * @param {File} file - The file to be uploaded.
 * @param {string} url - The URL to upload the file to.
 * @param {Object} fields - Additional fields to include in the request.
 * @throws {Error} If the file fails to upload to S3.
 */
const uploadFile = async (file, url, fields) => {
  const formData = new FormData();
  for (const key in fields) {
    formData.append(key, fields[key]);
  }
  formData.append("Content-Type", "image/png");
  formData.append("file", file);
  const response = await fetch(url, { method: "POST", body: formData });
  if (!response.ok) {
    throw new Error("Failed to upload file to S3.");
  }
};

/**
 * UploadButton component for uploading images.
 */
const UploadButton = ({ file, setFile, description, setDescription, setFileId }) => {
  const validateImage = (file) => {
    if (!file) {
      window.alert("Please provide an valid image to upload.");
      return false;
    }
    if (file.name.split(".").pop().toLowerCase() !== "png") {
      window.alert("Please upload a .png file.");
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      window.alert("Your file is too large. Please upload a file smaller than 5 MB.");
      return false;
    }
    return true;
  };

  const uploadHandler = async () => {
    if (!validateImage(file)) {
      return;
    }
    try {
      const fileBuffer = await readFileBuffer(file);
      const hash = md5.base64(fileBuffer);
      const dimensions = await readImageDimensions(file);

      const { url, fields, id } = await getPresignedUrl(hash, dimensions, description);
      await uploadFile(file, url, fields);
      window.alert("Image uploaded successfully.");
      setFile(null);
      setDescription("");
      setFileId(id);
    } catch (error) {
      console.error(error);
      window.alert("Failed to upload the image.");
    }
  };
  return <button onClick={uploadHandler}>Submit</button>;
};

export { SelectFileButton, UploadButton };
