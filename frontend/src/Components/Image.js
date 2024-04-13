import React, { useState, useEffect } from "react";

const DisplayImageById = ({ id, showPanel }) => {
  const [image, setImage] = useState(null);
  const [msg, setMsg] = useState("Loading...");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await fetch(`/api/v1/img/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch image");
        }
        const { url, description } = await response.json();

        const imageResponse = await fetch(url);
        if (!imageResponse.ok) {
          throw new Error("Failed to fetch image");
        }

        const imageData = await imageResponse.blob();

        setImage(URL.createObjectURL(imageData));
        setMsg("");
        setDescription(description);
      } catch (error) {
        console.error(error);
        setMsg("Failed to get the image. The image may not exist.");
      }
    };

    fetchImage();
  }, [id]);

  return (
    <div className="image-with-description">
      {image && <img src={image} alt="ID" />}
      {showPanel && description && description.length !== 0 && (
        <div>
          <h3>Level description</h3>
          <p>{description}</p>
        </div>
      )}
      {showPanel && msg && <p>{msg}</p>}
    </div>
  );
};

export { DisplayImageById };
