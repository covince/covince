import React from 'react';
import Covid19 from "./components/Covid19"
import NavBar from "./components/NavBar"
import './App.css';
import ContainerWithTimer from './components/ContainerWithTimer';

function App() {
  return (
    <React.Fragment>
      <NavBar />
    <div className="container">
      
      <ContainerWithTimer />
    </div>
    </React.Fragment>
  );
}

export default App;
