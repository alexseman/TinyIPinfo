import {Search} from 'react-bootstrap-icons';

const IpQueryForm = ({query, setQuery, onSubmit}) => {
  return <>
    <form onSubmit={onSubmit}>
      <label htmlFor="ip-query-input" className="form-label">Query IP</label>
      <div className="input-group">
        <input className="form-control form-control-lg text-center"
               type="text" placeholder="0.0.0.0"
               id="ip-query-input"
               value={query}
               onChange={(e) => setQuery(e.target.value.replace(/[a-z]/gi, ''))}/>
        <button className="btn btn-outline-secondary" type="submit"><Search/></button>
      </div>
    </form>
  </>
};

export default IpQueryForm;
