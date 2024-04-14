import React from "react";
import md5 from "js-md5";

const SelectButton = ({ setFile, setFileId }) => {
  const fileChangedHandler = (event) => {
    setFile(event.target.files[0]);
    setFileId("");
  };
  return <input type="file" accept="image/png" onChange={fileChangedHandler} />;
};

const InputField = ({ description, setDescription }) => {
  const descriptionChangeHandler = (event) => {
    setDescription(event.target.value);
  };
  return <input type="text" placeholder="Level Description" value={description} onChange={descriptionChangeHandler} />;
};

const readFileBuffer = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      resolve(event.target.result);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });

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

export { SelectButton, InputField, UploadButton };
