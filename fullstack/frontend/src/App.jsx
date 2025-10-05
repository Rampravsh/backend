import React, { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";
const App = () => {
  const [jokes, setJokes] = useState([]);
  useEffect(() => {
    axios
      .get("api/jokes")
      .then((response) => {
        setJokes(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  return (
    <div>
      <h1>Hello World!</h1>
      <p>Jokes : {jokes.length}</p>
      {jokes.map((joke, index) => (
        <h2 key={index}>{joke}</h2>
      ))}
    </div>
  );
};

export default App;
