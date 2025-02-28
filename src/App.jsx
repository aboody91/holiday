import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import Select from 'react-select';
import './App.css';

function App() {
  const [countryCode, setCountryCode] = useState('');
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);

  const countryOptions = [
    { value: 'US', label: 'United States' },
    { value: 'CA', label: 'Canada' },
    { value: 'GB', label: 'United Kingdom' },
    { value: 'DE', label: 'Germany' },
    { value: 'FR', label: 'France' },
    { value: 'AU', label: 'Australia' },
    { value: 'IN', label: 'India' },
    { value: 'BR', label: 'Brazil' },
    { value: 'JP', label: 'Japan' },
    { value: 'MX', label: 'Mexico' },
  ];

  useEffect(() => {
    const getCountryCode = async () => {
      try {
        const response = await axios.get('https://api.iplocation.net?cmd=getcountry');
        setCountryCode(response.data.country_code);
        setSelectedCountry(countryOptions.find(option => option.value === response.data.country_code) || null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getCountryCode();
  }, []);

  useEffect(() => {
    const fetchHolidays = async () => {
      if (selectedCountry) {
        try {
          setLoading(true);
          const year = new Date().getFullYear();
          const response = await axios.get(`https://date.nager.at/api/v3/PublicHolidays/${year}/${selectedCountry.value}`);
          setHolidays(response.data);
          setError(null);
        } catch (err) {
          setError(err.message);
          setHolidays([]);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchHolidays();
  }, [selectedCountry]);

  const sortedHolidays = React.useMemo(() => {
    return [...holidays].sort((a, b) => moment(a.date).valueOf() - moment(b.date).valueOf());
  }, [holidays]);

  const handleChangeCountry = (selectedOption) => {
    setSelectedCountry(selectedOption);
  };

  if (loading) {
    return <div className="loading">Loading holidays...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="container">
      <h1>Public Holidays</h1>
      <div className="country-select">
        <label>Select Country:</label>
        <Select
          value={selectedCountry}
          onChange={handleChangeCountry}
          options={countryOptions}
          placeholder="Select a country"
        />
      </div>
      {sortedHolidays.length > 0 ? (
        <table className="holidays-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Holiday</th>
              <th>Countdown</th>
            </tr>
          </thead>
          <tbody>
            {sortedHolidays.map((holiday) => (
              <tr key={holiday.date}>
                <td>{moment(holiday.date).format('MMMM DD, YYYY')}</td>
                <td>{holiday.name}</td>
                <td>
                  {moment(holiday.date).isBefore(moment()) ? (
                    'Passed'
                  ) : (
                    <span>
                      {moment(holiday.date).diff(moment(), 'days')} days,{' '}
                      {moment(holiday.date).diff(moment(), 'hours') % 24} hours,{' '}
                      {moment(holiday.date).diff(moment(), 'minutes') % 60} minutes
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="no-holidays">No holidays found for the selected country.</div>
      )}
    </div>
  );
}

export default App;
