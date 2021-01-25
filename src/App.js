import React from 'react';
import Covid19 from "./components/Covid19"
import NavBar from "./components/NavBar"
import './App.css';

function App() {
  return (
    <React.Fragment>
      <NavBar />
    <div className="container">
      
      <Covid19 />
    </div>
    </React.Fragment>
  );
}

export default App;
