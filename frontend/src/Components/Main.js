import { SelectFileButton, UploadButton } from "./Upload";
import { InputField } from "./InputField";
import { QrCodeImage, QrCodeScanner } from "./QrCode";
import { PreviewImage, ImageFromID } from "./Image";
import { SearchButton } from "./Search";

import React, { useState } from "react";

/**
 * Renders the UploadComponent, which allows users to upload an image, provide a description, and save a QR code.
 */
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

/**
 * Renders the ScanComponent.
 */
const ScanComponent = () => {
    const [scannedFileId, setScannedFileId] = useState("");
    const [isScanning, setIsScanning] = useState(true);

    return (
        <div className="App-Scan">
            {isScanning ? <h2>Scan an QR Code</h2> : <h2>Image from the QR Code</h2>}
            <div className="container scan-result">
                {isScanning && <QrCodeScanner setScannedFileId={setScannedFileId} setIsScanning={setIsScanning} />}
                {!isScanning && <ImageFromID id={scannedFileId} verbose={true} />}
            </div>
            {!isScanning && <button onClick={() => setIsScanning(true)}>Scan Another One</button>}
        </div>
    );
};

/**
 * Renders a search component that allows users to search images by description.
 */
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
                            <ImageFromID id={id} verbose={false} />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export { UploadComponent, ScanComponent, SearchComponent };