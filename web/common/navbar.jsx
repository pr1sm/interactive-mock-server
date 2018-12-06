import React from 'react';

import '../sass/navbar.scss';

const Navbar = () => (
  <nav className="navbar navbar--dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
    <a className="navbar__brand col-sm-3 col-md-2 mr-0" href="/">
      MockServer
    </a>
  </nav>
);

export default Navbar;
