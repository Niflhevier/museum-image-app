const SearchButton = ({ searchDescription, setSearchResult}) => {
  const searchHandler = async () => {
    const response = await fetch("/api/v1/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ description: searchDescription }),
    }).catch((error) => {
      console.error(error);
    });

    if (response.ok) {
      const { result } = await response.json();
      if (result.length === 0) {
        window.alert("No result found.");
        return;
      }
      setSearchResult(result);
    } else {
      window.alert("Search failed.");
    }
  };

  return <button onClick={searchHandler}>Search</button>;
};

export { SearchButton };
