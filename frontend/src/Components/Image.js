import React, { useState, useEffect } from "react";

const ImageFromUrl = ({ id, verbose }) => {
  const [image, setImage] = useState(null);
  const [msg, setMsg] = useState("Loading...");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const { url, description } = await (await fetch(`/api/v1/img/${id}`)).json();
        const data = await (await fetch(url)).blob();

        if (!data.type.startsWith("image/")) {
          throw new Error("The fetched file is not an image.");
        }

        setImage(URL.createObjectURL(data));
        setMsg("");
        setDescription(description);
      } catch (error) {
        console.error(error);
        setMsg("Failed to get the image. The image may not exist.");
      } finally {
        return () => URL.revokeObjectURL(image);
      }
    };

    fetchImage();
  }, [id]);

  return (
    <div className="image-with-description">
      {image && <img src={image} alt="ID" />}
      {verbose && description && (
        <div>
          <h3>Level description</h3>
          <p>{description}</p>
        </div>
      )}
      {verbose && msg && <p>{msg}</p>}
    </div>
  );
};

export { ImageFromUrl };
