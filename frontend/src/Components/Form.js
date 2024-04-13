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

const UploadButton = ({ file, setFile, description, setDescription, setFileId }) => {
  // submitHandler -> validateFile -> readImageFile -> uploadImageMetadata -> uploadImageFile
  const validateFile = (file) => {
    if (!file) {
      window.alert("Please provide an image to upload.");
      return false;
    }

    const fileExtension = file.name.split(".").pop().toLowerCase();
    if (fileExtension !== "png") {
      window.alert("Please upload a .png file.");
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      window.alert("Your file is too large. Please upload a file smaller than 5 MB.");
      return false;
    }

    return true;
  };

  const readImageFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve(event.target.result);
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const uploadImageMatadata = async (file, description) => {
    const hash = md5.base64(await readImageFile(file));

    const image = new Image();
    image.src = URL.createObjectURL(file);
    await image.decode();

    const response = await fetch("/api/v1/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ md5: hash, description, dimensions: { width: image.width, height: image.height } }),
    }).catch((error) => {
      console.error(error);
    });

    if (response.ok) {
      const { url, fields, imageId } = await response.json();
      await uploadImageFile(url, fields, file, imageId);
    } else {
      window.alert("Upload failed.");
    }
  };

  const uploadImageFile = async (url, fields, file, imageId) => {
    const formData = new FormData();
    for (const key in fields) {
      formData.append(key, fields[key]);
    }
    formData.append("Content-Type", "image/png");
    formData.append("file", file);

    const response = await fetch(url, {
      method: "POST",
      body: formData,
    }).catch((error) => {
      window.alert("Upload failed.");
      console.error(error);
    });

    if (!response.ok) {
      window.alert("Upload failed.");
      return;
    }
    window.alert("Upload successful.");
    setFile(null);
    setDescription("");
    setFileId(imageId);
  };

  const submitHandler = async () => {
    if (validateFile(file)) {
      await uploadImageMatadata(file, description);
    }
  };

  return <button onClick={submitHandler}>Submit</button>;
};

export { SelectButton, InputField, UploadButton };
