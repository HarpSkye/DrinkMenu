const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData
  });
 

  useEffect(() => {
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};
const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true
      };
    default:
      throw new Error();
  }
};

const handleSubmit = (event) => {
  doFetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=margarita`);
  setValidSelection(true);
  event.preventDefault();
}

function App() {
  const { Fragment, useState, useEffect, useReducer } = React;
  const [query, setQuery] = useState("Search Here...");
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "https://www.thecocktaildb.com/api/json/v1/1/search.php?s=margarita",
    {
      drinks: []
    }
  );
  const [validSelection, setValidSelection] = React.useState(true);
  const [isOrdinary, setIsOrdinary] = React.useState(true);
  const [drinkMode, setDrinkMode] = React.useState("");
  const [drinkList, setDrinkList] = React.useState(data.drinks);

  const handleModeSelect = (event) => {
    console.log(`handleModeSelect ${event.target.value}`);
    setDrinkMode(event.target.value);
    setValidSelection(false);
    if (event.target.value === "Ordinary Drink"){
      setIsOrdinary(true)
    } else {
      setIsOrdinary(false)
    }
  };
  return (
    <Fragment>
      <form onSubmit={handleSubmit}>
        <select onChange={(e) => handleModeSelect(e)} name="mode" id="mode-select">
          <option value="">Select your Drink</option>
          {data.drinks
            .reduce((acc, {strCategory}) => acc.includes(strCategory) ? acc : [...acc, strCategory], [])
            .map(category => <option key={category} value={category}>{category}</option>)}
          {/* <option id="no-selection" value="">Select your Drink</option>
          <option id="ordinary-selection" value="Ordinary Drink">Ordinary Drink</option>
          <option id="cocktail-selection" value="Cocktail">Cocktail</option> */}
        </select>
          {/* <input
            type="text"
            value={query}
            onChange={event => setQuery(event.target.value)}
          />
          <button type="submit">Search</button> */}
      </form>

      {isError && <div>Something went wrong ...</div>}

      {isLoading ? 
      (
        <div>Loading ...</div>
      )
      : (
        <ul>{data.drinks.filter(item => drinkMode === "" || item.strCategory === drinkMode).map(item => (
            <li key={item}>
              <a>{item.strDrink}</a> 
              <br></br>
              <a>{item.strCategory}</a>
            </li>
            
          ))}
        </ul>
      )}
    </Fragment>
  );
}

// ========================================
ReactDOM.render(<App />, document.getElementById("root"));
