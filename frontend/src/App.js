import "./App.css";
import { SelectFileButton, UploadButton } from "./Components/Upload";
import { InputField } from "./Components/InputField";
import { QrCodeImage, QrCodeScanner } from "./Components/QrCode";
import { PreviewImage, ImageFromUrl } from "./Components/Image";
import { navEnum, NavgationBar } from "./Components/Navgation";
import { SearchButton } from "./Components/Search";

import React, { useEffect, useState } from "react";

const UploadComponent = () => {
  const [file, setFile] = useState(null);
  const [fileId, setFileId] = useState("");
  const [description, setDescription] = useState("");

  return (
    <div className="App-Upload">
      {!fileId ? <h2>Upload an Image</h2> : <h2>Save Your QR Code</h2>}
      {!fileId && <SelectFileButton setFile={setFile} setFileId={setFileId} />}
      {file && (
        <div className="container">
          <PreviewImage file={file} />
          <InputField file={file} description={description} setDescription={setDescription} />
          <UploadButton
            file={file}
            setFile={setFile}
            description={description}
            setDescription={setDescription}
            setFileId={setFileId}
          />
        </div>
      )}
      {fileId && <QrCodeImage content={fileId} />}
      {fileId && <button onClick={() => setFileId(false)}>Upload Another One</button>}
    </div>
  );
};

const ScanComponent = () => {
  const [scannedFileId, setScannedFileId] = useState("");
  const [isScanning, setIsScanning] = useState(true);

  return (
    <div className="App-Scan">
      {isScanning ? <h2>Scan an QR Code</h2> : <h2>Image from the QR Code</h2>}
      <div className="container scan-result">
        {isScanning && <QrCodeScanner setScannedFileId={setScannedFileId} setIsScanning={setIsScanning} />}
        {!isScanning && <ImageFromUrl id={scannedFileId} verbose={true} />}
      </div>
      {!isScanning && <button onClick={() => setIsScanning(true)}>Scan Another One</button>}
    </div>
  );
};

const SearchComponent = () => {
  const [searchDescription, setSearchDescription] = useState("");
  const [searchResult, setSearchResult] = useState([]);

  return (
    <div className="App-Search">
      <h2>Search by Description</h2>
      <div className="search-bar">
        <InputField description={searchDescription} setDescription={setSearchDescription} />
        <SearchButton searchDescription={searchDescription} setSearchResult={setSearchResult} />
      </div>
      {searchResult.length !== 0 && (
        <ul className="images-container">
          {searchResult.map(({ id }) => (
            <li key={id}>
              <ImageFromUrl id={id} verbose={false} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

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
