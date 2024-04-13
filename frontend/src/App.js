import "./App.css";
import { SelectButton, InputField, UploadButton } from "./Components/Form";
import { QrCodeImage, QrCodeScanner } from "./Components/QrCode";
import { DisplayImageById } from "./Components/Image";
import { UIStateEnum, NavgationBar } from "./Components/NavgationBar";

import React, { useEffect, useState } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [fileId, setFileId] = useState("");
  const [scannedFileId, setScannedFileId] = useState("");
  const [isScanning, setIsScanning] = useState(true);
  const [uiState, setUiState] = useState(UIStateEnum.UPLOAD);

  // Starting up
  useEffect(() => {
    const url = window.location.href;
    if (url && url.indexOf("#") !== -1) {
      const state = url.substring(url.indexOf("#") + 1);
      console.log(state);
      if (state === "scan") {
        setUiState(UIStateEnum.SCAN);
      } else if (state === "search") {
        setUiState(UIStateEnum.SEARCH);
      } else {
        setUiState(UIStateEnum.UPLOAD);
      }
    }
  }, []);

  return (
    <div className="App">
      <h1>Museum Image App</h1>
      <NavgationBar uiState={uiState} setUiState={setUiState} />
      <hr />
      <div className={uiState === UIStateEnum.UPLOAD ? "App-Form show" : "App-Form hide"}>
        {!fileId ? <h2>Upload an Image</h2> : <h2>Save Your QR Code</h2>}
        {!fileId && <SelectButton setFile={setFile} setFileId={setFileId} />}
        {file && (
          <div className="container">
            <img src={URL.createObjectURL(file)} alt="Preview" />
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
        {fileId && <QrCodeImage fileId={fileId} />}
        {fileId && <button onClick={() => setFileId(false)}>Upload Another One</button>}
      </div>

      <div className={uiState === UIStateEnum.SCAN ? "App-Scan show" : "App-Scan hide"}>
        {isScanning ? <h2>Scan an QR Code</h2> : <h2>Image from the QR Code</h2>}
        <div className="container">
          {isScanning && <QrCodeScanner setScannedFileId={setScannedFileId} setIsScanning={setIsScanning} />}
          {!isScanning && <DisplayImageById id={scannedFileId} />}
        </div>
        {!isScanning && <button onClick={() => setIsScanning(true)}>Scan Another One</button>}
      </div>
    </div>
  );
}

export default App;
