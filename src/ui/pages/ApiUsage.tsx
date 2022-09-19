import {useState, useEffect, useRef} from 'react';
import queryUsage                    from '../api/queryUsage';
import ApiUsageChart                 from '../components/ApiUsageChart';
import ApiUsageForm                  from '../components/ApiUsageForm';
import ErrorMessage                  from '../components/ErrorMessage';
import WarningMessage                from '../components/WarningMessage';
import UsageResult                   from '../types/UsageResult';

const ApiUsage = ({
                    usageGivenTimeframe,
                    setUsageGivenTimeframe,
                    usageRangeFrom,
                    setUsageRangeFrom,
                    usageRangeTo,
                    setUsageRangeTo
                  }) => {

  const fromRef = useRef() as React.MutableRefObject<HTMLInputElement>;
  const toRef   = useRef() as React.MutableRefObject<HTMLInputElement>;

  const [usageResult, setUsageResult] = useState([] as UsageResult[]);
  const [errMsg, setErrMsg]           = useState('');
  const [warningMsg, setWarningMsg]   = useState('');
  const [success, setSuccess]         = useState(false);

  const checkFromIsBeforeTo = (): boolean => {
    if (usageRangeFrom >= usageRangeTo && (fromRef.current?.value && toRef.current?.value)) {
      setWarningMsg('Beginning range date should not reach or be past ending range date');
      return false;
    }

    return true;
  }

  useEffect(() => {
    if (
      ! checkFromIsBeforeTo() ||
      (usageGivenTimeframe === 'n/a' && ! (fromRef.current?.value && toRef.current?.value))
    ) {
      return;
    }

    setSuccess(false);
    setWarningMsg('');
    setErrMsg('');
    setUsageResult([]);
    console.log('o data in use effect');
    queryUsage(usageRangeFrom, usageRangeTo).then((data) => {
      setUsageResult(data as UsageResult[]);
      setSuccess(true);
    }).catch((error: { status: number, message: string }) => {
      if (error.status === 404) {
        setWarningMsg(error.message);
      } else {
        setErrMsg(error.message);
      }

      setSuccess(false);
    });
  }, [usageRangeFrom, usageRangeTo]);

  return <>
    <ApiUsageForm usageGivenTimeframe={usageGivenTimeframe} setUsageGivenTimeframe={setUsageGivenTimeframe}
                  setUsageRangeFrom={setUsageRangeFrom} setUsageRangeTo={setUsageRangeTo}
                  fromRef={fromRef} toRef={toRef}/>
    <div className="row my-5">
      {
        success && ! (warningMsg || errMsg) ?
          <ApiUsageChart usageResult={usageResult}/>
          :
          (
            (warningMsg) ?
              <div className="col col-8 mx-auto"><WarningMessage message={warningMsg}/></div>
              :
              (errMsg) ? <div className="col col-8 mx-auto"><ErrorMessage message={errMsg}/></div> : ''
          )
      }
    </div>
  </>
};

export default ApiUsage;
