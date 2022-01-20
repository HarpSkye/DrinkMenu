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

const filterByDrinkMode = drinkMode => drinks => drinks.filter(drink => drinkMode === "" || drink.strCategory === drinkMode)

const getCategories = drinks => drinks.reduce((acc, {strCategory}) => acc.includes(strCategory) ? acc : [...acc, strCategory], [])

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
          {getCategories(data.drinks)
            .map(category => <option key={category} value={category}>{category}</option>)}
        </select>
      </form>

      {isError && <div>Something went wrong ...</div>}

      {isLoading ? 
      (
        <div>Loading ...</div>
      )
      : (
        <ul>{filterByDrinkMode(drinkMode)(data.drinks).map(item => (
            <li key={item.idDrink}>
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
