import {useState}     from 'react';
import ErrorMessage   from '../components/ErrorMessage';
import IpQueryCard    from '../components/IpQueryCard';
import IpQueryForm    from '../components/IpQueryForm';
import WarningMessage from '../components/WarningMessage';
import IpInfoResult   from '../types/IpInfoResult';
import queryIpInfo    from '../api/queryIpInfo';

const IpQuery = () => {
  const [query, setQuery]               = useState('');
  const [ipInfoResult, setIpInfoResult] = useState({} as IpInfoResult);
  const [errMsg, setErrMsg]             = useState('');
  const [warningMsg, setWarningMsg]     = useState('');
  const [success, setSuccess]           = useState(false);

  const handleIpQuerySubmit = (ev: Event) => {
    ev.preventDefault();
    setSuccess(false);
    setWarningMsg('');
    setErrMsg('');
    setIpInfoResult({} as IpInfoResult);

    queryIpInfo(query).then((data) => {
      setIpInfoResult(data as IpInfoResult);
      setSuccess(true);
    }).catch((error: { status: number, message: string }) => {
      if (error.status === 404) {
        setWarningMsg(error.message);
      } else {
        setErrMsg(error.message);
      }

      setSuccess(false);
    });
  }

  return <>
    <div className="row my-5">
      <div className="col col-4 mx-auto align-self-center">
        <IpQueryForm query={query} setQuery={setQuery} onSubmit={handleIpQuerySubmit}/>
      </div>
    </div>
    <div className="row my-5">
      <div className="col col-8 mx-auto">
        {
          success ?
            <IpQueryCard ipInfoResult={ipInfoResult}/>
            :
            (
              (warningMsg) ?
                <WarningMessage message={warningMsg}/>
                :
                (errMsg) ? <ErrorMessage message={errMsg}/> : ''
            )
        }
      </div>
    </div>
  </>
};

export default IpQuery;
