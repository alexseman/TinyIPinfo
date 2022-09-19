import {Link, useMatch, useResolvedPath} from 'react-router-dom';

const NavLink = ({to, children, ...props}) => {
  const resolvedPath = useResolvedPath(to);
  const isActive     = useMatch({path: resolvedPath.pathname, end: true});

  return (
    <Link to={to} className={`nav-link ${isActive ? 'active' : ''}`}>
      {children}
    </Link>
  )
};

export default NavLink;
