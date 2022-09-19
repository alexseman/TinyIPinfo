import {useState}                                   from 'react';
import {Route, Routes}                              from 'react-router-dom';
import ApiUsage                                     from '../pages/ApiUsage';
import IpQuery                                      from '../pages/IpQuery';
import {getStartOfDayTimestamp, secondsInTimeframe} from '../util/time';
import Footer                                       from './Footer';
import Header                                       from './Header';

const App = () => {
  const today = getStartOfDayTimestamp();

  const [usageGivenTimeframe, setUsageGivenTimeframe] = useState('past-month');
  const [usageRangeFrom, setUsageRangeFrom]           = useState(today - secondsInTimeframe.secondsInMonth);
  const [usageRangeTo, setUsageRangeTo]               = useState(today);

  return <>
    <Header/>
    <main className="flex-shrink-0 container-lg">
      <Routes>
        <Route path="/" element={<IpQuery/>}/>
        <Route path="/api-usage" element={<ApiUsage usageGivenTimeframe={usageGivenTimeframe}
                                                    setUsageGivenTimeframe={setUsageGivenTimeframe}
                                                    usageRangeFrom={usageRangeFrom}
                                                    setUsageRangeFrom={setUsageRangeFrom}
                                                    usageRangeTo={usageRangeTo} setUsageRangeTo={setUsageRangeTo}
        />}/>
      </Routes>
    </main>
    <Footer/>
  </>
}

export default App;
