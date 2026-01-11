import React, { useState } from "react";
import Sidebar from "../layout/AdminSidebar";
import EventInfoCard from "../layout/AdminBoxInfo";
import ReactQrScanner from "react-qr-scanner";
import { transactionApi } from "../api/transactionApi";

const Checkin = () => {
  const [scannedTicketCode, setScannedTicketCode] = useState(null);
  const [isValid, setIsValid] = useState(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [isScanning, setIsScanning] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleScan = async (data) => {
    if (data && !isProcessing && scannedTicketCode !== data.text) {
      setIsProcessing(true);
      setScannedTicketCode(data.text);
      try {
        const response = await transactionApi.validateQRCode(data.text);
        setResponseMessage(response.message);
        setIsValid(response.success);
      } catch (error) {
        console.error("Error validating ticket: ", error);
        setIsValid(false);
        setResponseMessage(error.response.data.message);
      } finally {
        setIsProcessing(false);
        setIsScanning(false);
      }
    }
  };

  const handleError = (error) => {
    console.error("QR Scanner Error:", error);
    setIsValid(false);
    setResponseMessage("QR Scanner Error:", error);
    setIsScanning(false);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-6 bg-gray-50">
        {/* Kotak informasi */}
        <EventInfoCard />

        {/* QR Code Scanner */}
        <div className="bg-white p-4 rounded-lg shadow-md overflow-y-auto">
          <h2 className="text-xl font-semibold text-center mb-4">
            Scan QR Ticket
          </h2>

          {/* Wrapper untuk QR Scanner */}
          <div className="flex justify-center items-center mb-4">
            {isScanning ? (
              <ReactQrScanner
                delay={300}
                facingMode="environment"
                resolution={500}
                style={{ width: "50%", height: "auto" }}
                onScan={handleScan}
                onError={handleError}
              />
            ) : (
              <div className="flex flex-col items-center">
                {responseMessage ? (
                  <div
                    className={`p-4 rounded-lg max-w-md w-full text-center ${
                      isValid
                        ? "bg-green-200 text-green-800"
                        : "bg-red-200 text-red-800"
                    }`}
                  >
                    <h3 className="text-lg-semibold">
                      {isValid ? "Sukses" : "Gagal"}
                    </h3>
                    <p>{responseMessage}</p>
                  </div>
                ) : (
                  <p>Memproses data tiket...</p>
                )}

                {/* Tombol untuk mengulang pemindaian */}
                <button
                  onClick={() => {
                    setIsScanning(true);
                    setScannedTicketCode(null);
                    setIsValid(null);
                    setResponseMessage("");
                  }}
                  className="mt-4 bg-blue-500 text-white py-2 px-6 rounded-lg"
                >
                  Scan Tiket Lain
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkin;
