import React, { useState, useEffect } from "react";

/**
 * This component renders a preview of an image.
 */
const PreviewImage = ({ file }) => {
  const [image, setImage] = useState(null);

  useEffect(() => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img
      .decode()
      .then(() => setImage(img.src))
      .catch(console.error);
    return () => URL.revokeObjectURL(img.src);
  }, [file]);

  return <img src={image} alt="" />;
};


/**
 * This component renders an image based on the provided ID.
 */
const ImageFromID = ({ id, verbose }) => {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await fetch(`/api/v1/img/${id}`);
        if (!response.ok) {
          throw new Error("Failed to get the presigned URL when fetching the image.");
        }

        const { url, description } = await response.json();
        const data = await (await fetch(url)).blob();

        if (!data.type.startsWith("image/")) {
          throw new Error("The fetched file is not an image.");
        }
        setFile(data);
        setDescription(description);
      } catch (error) {
        console.error(error);
        setDescription("Failed to get the image. The image may not exist.");
      }
    };

    fetchImage();
  }, [id]);

  return (
    <div>
      {file && <PreviewImage file={file} />}
      {verbose && file && <h3>Level description</h3>}
      {verbose && description && <p>{description}</p>}
    </div>
  );
};

export { PreviewImage, ImageFromID };
