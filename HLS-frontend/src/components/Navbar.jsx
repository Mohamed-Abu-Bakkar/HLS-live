import { Link, useLocation } from 'react-router-dom';
import { Building2, Plus, Hotel } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          <div className="brand-icon">
            <Building2 size={22} />
          </div>
          <span>HLS</span>
        </Link>

        <nav className="nav-links">
          <Link
            to="/"
            className={`btn btn-sm ${
              location.pathname === '/' ? 'btn-outline' : 'btn-outline'
            }`}
          >
            <Hotel size={16} />
            <span>Explore Hotels</span>
          </Link>

          <Link to="/hotels/new" className="btn btn-primary btn-sm">
            <Plus size={16} />
            <span>Add New Hotel</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
