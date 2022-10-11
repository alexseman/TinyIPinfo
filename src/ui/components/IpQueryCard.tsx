import {useEffect, useState} from 'react';

const IpQueryCard = ({ipInfoResult}) => {
  const [ip, setIp]             = useState('');
  const [hostname, setHostname] = useState('');
  const [city, setCity]         = useState('');
  const [postal, setPostal]     = useState('');
  const [country, setCountry]   = useState('');
  const [region, setRegion]     = useState('');
  const [loc, setLoc]           = useState('');
  const [timezone, setTimezone] = useState('');

  useEffect(() => {
    for (const resultField in ipInfoResult) {
      switch (resultField) {
        case 'ip':
          setIp(ipInfoResult[resultField]);
          break;
        case 'hostname':
          setHostname(ipInfoResult[resultField]);
          break;
        case 'city':
          setCity(ipInfoResult[resultField]);
          break;
        case 'postal':
          setPostal(ipInfoResult[resultField]);
          break;
        case 'country':
          setCountry(ipInfoResult[resultField]);
          break;
        case 'region':
          setRegion(ipInfoResult[resultField]);
          break;
        case 'loc':
          setLoc(ipInfoResult[resultField]);
          break;
        case 'timezone':
          setTimezone(ipInfoResult[resultField]);
          break;
      }
    }
  }, []);

  return <>
    <div className="card">
      <ul className="list-group list-group-flush">
        {ip ? <li className="list-group-item"><span className="key">Ip: </span><span className="float-end">{ip}</span>
        </li> : ''}
        {hostname ? <li className="list-group-item"><span className="key">Hostname: </span><span
          className="float-end">{hostname}</span></li> : ''}
        {city ?
          <li className="list-group-item"><span className="key">City: </span><span className="float-end">{city}</span>
          </li> : ''}
        {country ? <li className="list-group-item"><span className="key">Country: </span><span
          className="float-end">{country}</span></li> : ''}
        {region ? <li className="list-group-item"><span className="key">Region: </span><span
          className="float-end">{region}</span></li> : ''}
        {loc ?
          <li className="list-group-item"><span className="key">Loc: </span><span className="float-end">{loc}</span>
          </li> : ''}
        {postal ? <li className="list-group-item"><span className="key">Postal: </span><span
          className="float-end">{postal}</span></li> : ''}
        {timezone ? <li className="list-group-item"><span className="key">Timezone: </span><span
          className="float-end">{timezone}</span></li> : ''}
      </ul>
    </div>
  </>
};

export default IpQueryCard;
