import {getEndOfDayTimestamp, getStartOfDayTimestamp, secondsInTimeframe} from '../util/time';

const ApiUsageForm = ({
                        usageGivenTimeframe,
                        setUsageGivenTimeframe,
                        setUsageRangeFrom,
                        setUsageRangeTo,
                        fromRef,
                        toRef
                      }) => {

  const onGivenTimeframeChange = (selectedTimeframe: string) => {
    setUsageGivenTimeframe(selectedTimeframe);
    const today = getStartOfDayTimestamp();

    switch (selectedTimeframe) {
      case 'today':
        setUsageRangeFrom(today - secondsInTimeframe.secondsInDay);
        break;
      case 'past-week':
        setUsageRangeFrom(today - secondsInTimeframe.secondsInWeek);
        break;
      case 'past-month':
        setUsageRangeFrom(today - secondsInTimeframe.secondsInMonth);
        break;
      case 'past-year':
        setUsageRangeFrom(today - secondsInTimeframe.secondsInYear);
        break;
      default:
        return;
    }

    fromRef.current.value = '';
    toRef.current.value   = '';
    setUsageRangeTo(today);
  };

  const onRangeFromChange = (from: string) => {
    if (! from) {
      return;
    }

    setUsageRangeFrom(getStartOfDayTimestamp(from));
    setUsageGivenTimeframe('n/a');
  };

  const onRangeToChange = (to: string) => {
    if (! to) {
      return;
    }

    setUsageRangeTo(getEndOfDayTimestamp(to));
    setUsageGivenTimeframe('n/a');
  };

  return <form className="row my-5">
    <div className="col col-4">
      <div className="input-group">
        <label className="input-group-text" htmlFor="usage-given-timeframe">Requests for</label>
        <select className="form-select" id="usage-given-timeframe" value={usageGivenTimeframe}
                onChange={(ev) => onGivenTimeframeChange(ev.target.options[ev.target.selectedIndex].value)}>
          <option value="n/a">Select&hellip;</option>
          <option value="today">Today</option>
          <option value="past-week">Past Week</option>
          <option value="past-month">Past Month</option>
          <option value="past-year">Past Year</option>
        </select>
      </div>
    </div>
    <div className="col col-8">
      <div className="input-group">
        <span className="input-group-text">Or date range</span>
        <input type="date" placeholder="from" aria-label="First name" className="form-control"
               onChange={(ev) => onRangeFromChange(ev.target.value)}
               ref={fromRef}/>
        <input type="date" placeholder="to" aria-label="Last name" className="form-control"
               onChange={(ev) => onRangeToChange(ev.target.value)}
               ref={toRef}/>
      </div>
    </div>
  </form>
};

export default ApiUsageForm;
