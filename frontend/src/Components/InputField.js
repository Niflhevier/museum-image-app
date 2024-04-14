const InputField = ({ description, setDescription }) => {
  const descriptionChangeHandler = (event) => {
    setDescription(event.target.value);
  };
  return <input type="text" placeholder="Level Description" value={description} onChange={descriptionChangeHandler} />;
};

export { InputField };