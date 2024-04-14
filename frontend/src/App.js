import "./App.css";
import { UploadComponent, ScanComponent, SearchComponent } from "./Components/Main";
import { navEnum, NavgationBar } from "./Components/Navgation";

import React, { useEffect, useState } from "react";


function App() {
  const [nav, setNav] = useState(navEnum.UPLOAD);

  // Starting from a specific page based on the URL
  useEffect(() => {
    const url = window.location.href;
    if (url && url.indexOf("#") !== -1) {
      const state = url.substring(url.indexOf("#") + 1);
      if (state === "scan") {
        setNav(navEnum.SCAN);
      } else if (state === "search") {
        setNav(navEnum.SEARCH);
      } else {
        setNav(navEnum.UPLOAD);
      }
    }
  }, []);

  return (
    <div className="App">
      <h1>Museum Image</h1>
      <NavgationBar nav={nav} setNav={setNav} />
      <hr />
      <div className={nav === navEnum.UPLOAD ? "show" : "hide"}>
        <UploadComponent />
      </div>
      <div className={nav === navEnum.SCAN ? "show" : "hide"}>
        <ScanComponent />
      </div>
      <div className={nav === navEnum.SEARCH ? "show" : "hide"}>
        <SearchComponent />
      </div>
    </div>
  );
}

export default App;
