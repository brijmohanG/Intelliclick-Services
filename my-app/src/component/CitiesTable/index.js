import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Link } from 'react-router-dom';
import './index.css'; // Ensure you have your CSS file imported



const CitiesTable = () => {
  const [cities, setCities] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState({
    cityName: '',
    country: '',
    timezone: '',
    population: ''
  });

  const limit = 20;

  const buildQueryParams = () => {
    let query = '';
    const filterConditions = [];

    if (filters.cityName) {
      filterConditions.push(`name%20%3D%20%22${encodeURIComponent(filters.cityName)}%22`);
    }
    if (filters.country) {
      filterConditions.push(`cou_name_en%20%3D%20%22${encodeURIComponent(filters.country)}%22`);
    }
    if (filters.timezone) {
      filterConditions.push(`timezone%20%3D%20%22${encodeURIComponent(filters.timezone)}%22`);
    }
    if (filters.population) {
      filterConditions.push(`population%20%3D%20%22${encodeURIComponent(filters.population)}%22`);
    }

    if (filterConditions.length > 0) {
      query = `where=${filterConditions.join('%20AND%20')}`;
    }
    console.log(filterConditions)
    return query;
  };

  const fetchCities = useCallback(async () => {
    try {
      const offset = page * limit;
      const queryParams = buildQueryParams();
      let url;
      if(queryParams.length>0){
        url = `https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/geonames-all-cities-with-a-population-1000/records?${queryParams}&limit=20&offset=${offset}`
      }else{
        url = `https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/geonames-all-cities-with-a-population-1000/records?limit=20&offset=${offset}`
      }
      const response = await axios.get(url);
      const newCities = response.data.results;
      setCities(prev => [...prev, ...newCities]);
      setHasMore(newCities.length === limit);
    } catch (error) {
      console.error('Failed to fetch cities:', error);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  const fetchMoreData = () => {
    setPage(prev => prev + 1);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(0)
    setCities([])
  };

  return (
    <InfiniteScroll
      dataLength={cities.length}
      next={fetchMoreData}
      hasMore={hasMore}
      loader={<h4>Loading...</h4>}
    >
      <table>
        <thead>
          <tr>
            <th>
              City Name
              <select name="cityName" onChange={handleFilterChange} value={filters.cityName}>
                <option value="">All</option>
                {/* Replace these options with dynamic data if available */}
                {[...new Set(cities.map(city => city.name))].map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </th>
            <th>
              Country
              <select name="country" onChange={handleFilterChange} value={filters.country}>
                <option value="">All</option>
                {/* Replace these options with dynamic data if available */}
                {[...new Set(cities.map(city => city.cou_name_en))].map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </th>
            <th>
              Timezone
              <select name="timezone" onChange={handleFilterChange} value={filters.timezone}>
                <option value="">All</option>
                {/* Replace these options with dynamic data if available */}
                {[...new Set(cities.map(city => city.timezone))].map(timezone => (
                  <option key={timezone} value={timezone}>{timezone}</option>
                ))}
              </select>
            </th>
            <th>
              Population
              <select name="population" onChange={handleFilterChange} value={filters.population}>
                <option value="">All</option>
                {/* Replace these options with dynamic data if available */}
                {[...new Set(cities.map(city => city.population.toString()))].map(pop => (
                  <option key={pop} value={pop}>{pop}</option>
                ))}
              </select>
            </th>
          </tr>
        </thead>
        <tbody>
          {cities.map((city) => (
            <tr key={city.geoname_id}>
              <td>
                <Link to={`/weather/${city.geoname_id}`}>
                  {city.name}
                </Link>
              </td>
              <td>{city.cou_name_en}</td>
              <td>{city.timezone}</td>
              <td>{city.population}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </InfiniteScroll>
  );
};

export default CitiesTable;
