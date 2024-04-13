use("images");

db.createCollection("metadata", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["_id", "description", "dimensions"],
      properties: {
        _id: { bsonType: "objectId" },
        description: {
          bsonType: "string",
          description: "must be a string and is required",
        },
        dimensions: {
          bsonType: "array",
          description: "must be an array of two numbers",
          items: {
            bsonType: "number",
            minimum: 0,
          },
          minItems: 2,
          maxItems: 2,
        },
      },
    },
  },
  validationAction: "error",
});
