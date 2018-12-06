import React from 'react';
import { Link } from 'react-router-dom';

import '../sass/sidebar.scss';

const Sidebar = () => (
  <nav className="col-md-2 d-none d-md-block bg-light sidebar">
    <div className="sidebar--sticky">
      <ul className="nav flex-column">
        <li className="nav-item">
          <Link className="nav-link active" to="/__dashboard">
            <span data-feather="home" />
            Dashboard
            <span className="sr-only"> (current)</span>
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/__dashboard/endpoints">
            <span data-feather="server" />
            Endpoints
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/__dashboard/logs">
            <span data-feather="terminal" />
            Logs
          </Link>
        </li>
      </ul>
    </div>
  </nav>
);

export default Sidebar;
