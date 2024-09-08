import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import CitiesTable from './component/CitiesTable';
import WeatherPage from './component/WeatherPage';

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element = {<CitiesTable/>}/>
      <Route path="/weather/:cityId" element = {<WeatherPage/>}/>
    </Routes>
  </BrowserRouter>
);

export default App;