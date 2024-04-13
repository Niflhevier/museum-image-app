import QRCode from "react-qr-code";
import { useRef, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import { Html5QrcodeScanner } from "html5-qrcode";

const QrCodeImage = ({ fileId }) => {
  const qrCodeRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => qrCodeRef.current,
  });
  return (
    <div className="qrcode-container">
      <QRCode value={fileId} ref={qrCodeRef} />
      <button onClick={handlePrint}>Print QR Code</button>
    </div>
  );
};

// Source: https://github.com/scanapp-org/html5-qrcode-react
const ScanQrcodePlugin = (props) => {
  const ref = useRef(null);

  useEffect(() => {
    const config = {
      fps: props.fps ?? 10,
      qrbox: props.qrbox ?? 250,
      aspectRatio: props.aspectRatio ?? 1.0,
      disableFlip: props.disableFlip !== undefined,
    };

    // workaround to avoid multiple instances of the scanner
    // https://github.com/mebjas/html5-qrcode/issues/500
    if (ref.current === null) {
      ref.current = new Html5QrcodeScanner("reader", config, false);
    }

    const scanner = ref.current;

    setTimeout(() => {
      const container = document.getElementById("reader");
      if (scanner && container?.innerHTML === "") {
        scanner.render(props.qrCodeSuccessCallback, props.qrCodeErrorCallback);
      }
    }, 0);

    return () => {
      scanner.clear().catch((error) => {
        console.error("Failed to clear QrcodeScanner. ", error);
      });
    };
  }, []);
  return <div id="reader" />;
};

const QrCodeScanner = ({ setScannedFileId, setIsScanning }) => {
  const successCallback = (decodedText, decodedResult) => {
    console.log("decodedText", decodedText);
    setScannedFileId(decodedText);
    setIsScanning(false);
  };
  return <ScanQrcodePlugin qrCodeSuccessCallback={successCallback} qrCodeErrorCallback={null} />;
};

export { QrCodeImage, QrCodeScanner };
