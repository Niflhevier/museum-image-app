import QRCode from "react-qr-code";
import React from "react";
import { useReactToPrint } from "react-to-print";
// import { Scanner } from "@yudiel/react-qr-scanner";

const QrCodeImage = ({ fileId }) => {
  const qrCodeRef = React.useRef();

  const handlePrint = useReactToPrint({
    content: () => qrCodeRef.current,
  });

  return (
    <div className="App-container">
      <QRCode value={fileId} ref={qrCodeRef} />
      <button onClick={handlePrint}>Print QR Code</button>
    </div>
  );
};

const QrCodeScanner = () => {
  return (
    <div className="App-container">
      {/* <Scanner /> */}
    </div>
  );
};

export { QrCodeImage, QrCodeScanner };
