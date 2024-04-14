import React from "react";

const navEnum = {
  UPLOAD: 0,
  SCAN: 1,
  SEARCH: 2,
};

/**
 * This component renders a navigation bar.
 */
const NavgationBar = ({ setNav }) => {
  return (
    <nav className="nav-container">
      <ul>
        <li>
          <a id="sec-upload" href="#upload" onClick={() => setNav(navEnum.UPLOAD)}>
            Upload
          </a>
        </li>
        <li>
          <a id="sec-scan" href="#scan" onClick={() => setNav(navEnum.SCAN)}>
            Scan
          </a>
        </li>
        <li>
          <a id="sec-search" href="#search" onClick={() => setNav(navEnum.SEARCH)}>
            Search
          </a>
        </li>
      </ul>
    </nav>
  );
};

export { navEnum, NavgationBar };
