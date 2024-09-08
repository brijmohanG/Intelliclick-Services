import React, { useState, useEffect } from 'react';
import Autocomplete from 'react-autocomplete';
import axios from 'axios';

const SearchBar = () => {
  const [cities, setCities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await axios.get('https://public.opendatasoft.com/explore/dataset/geonames-all-cities-with-a-population-1000/api/?disjunctive.cou_name_en');
        setCities(response.data.records);
      } catch (error) {
        console.error(error);
      }
    };

    fetchCities();
  }, []);

  return (
    <Autocomplete
      getItemValue={(item) => item.fields.name}
      items={cities.filter(city => city.fields.name.toLowerCase().includes(searchTerm.toLowerCase()))}
      renderItem={(item, isHighlighted) => (
        <div key={item.fields.geonameid} style={{ background: isHighlighted ? 'lightgray' : 'white' }}>
          {item.fields.name}
        </div>
      )}
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      onSelect={(val) => setSearchTerm(val)}
    />
  );
};

export default SearchBar;
