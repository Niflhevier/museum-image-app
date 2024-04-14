/**
 * This component renders a search button.
 */
const SearchButton = ({ searchDescription, setSearchResult }) => {
  const searchHandler = async () => {
    try {
      const response = await fetch("/api/v1/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: searchDescription }),
      });

      if (!response.ok) {
        throw new Error("Search failed.");
      }

      const { result } = await response.json();
      
      if (!result) {
        throw new Error("No result found.");
      }

      setSearchResult(result);
    } catch (error) {
      window.alert(error.message);
    }
  };

  return <button onClick={searchHandler}>Search</button>;
};

export { SearchButton };
