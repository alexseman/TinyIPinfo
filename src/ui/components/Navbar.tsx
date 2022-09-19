import {Link}  from 'react-router-dom';
import NavLink from './NavLink';

const Navbar = () => {

  return <nav className="navbar navbar-expand-lg bg-light">
    <div className="container-fluid">
      <Link to="/" className="navbar-brand site-title">Tiny IPinfo</Link>
      <ul className="navbar-nav">
        <li className="nav-item">
          <NavLink className="nav-link" to="/" title="Go to homepage">Home</NavLink>
        </li>
        <li className="nav-item">
          <NavLink className="nav-link" to="/api-usage" title="See API Usage">API Usage</NavLink>
        </li>
      </ul>
    </div>
  </nav>
};

export default Navbar;
