import React, { useState } from "react";
import useAxios from "./use-axios";

const App = () => {
  const [id, setId] = useState("1");
  const axiosConfig = { method: "get", timeout: 2500 };
  const { isLoading, isError, response } = useAxios(
    `https://pokeapi.co/api/v2/pokemon/${id}`,
    axiosConfig
  );

  const pokemon = response?.data;

  const handleChange = (event) => {
    event.preventDefault();
    setId(event.target.value);
  };

  return (
    <div>
      <h4>useAxios Demo</h4>
      <h3>Enter Pokemon Id</h3>
      <input type="text" value={id} onChange={handleChange} />
      {pokemon && (
        <div>
          <p>Pokemon:</p>
          <code style={{ fontSize: "20px" }}>{pokemon.name}</code>
        </div>
      )}
      {isLoading && <p style={{ color: "blue", fontSize: "20px" }}>LOADING</p>}
      {isError && <p style={{ color: "red", fontSize: "20px" }}>ERROR</p>}
      <p>* try changing the input id quickly and watch the console and/or network
        tab</p>
    </div>
  );
};

export default App;
