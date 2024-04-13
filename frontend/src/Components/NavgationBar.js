import React from "react";

const UIStateEnum = {
  UPLOAD: 0,
  SCAN: 1,
  SEARCH: 2,
};

const NavgationBar = ({ uiState, setUiState }) => {
  const handleLinkClick = (state) => {
    setUiState(state);
  };

  return (
    <nav>
      <div className="nav-container">
        <ul>
          <li>
            <a id="sec-upload" href="#upload" onClick={() => handleLinkClick(UIStateEnum.UPLOAD)}>
              Upload
            </a>
          </li>
          <li>
            <a id="sec-scan" href="#scan" onClick={() => handleLinkClick(UIStateEnum.SCAN)}>
              Scan
            </a>
          </li>
          <li>
            <a id="sec-search" href="#search" onClick={() => handleLinkClick(UIStateEnum.SEARCH)}>
              Search
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export { UIStateEnum, NavgationBar };
