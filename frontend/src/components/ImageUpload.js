import React, { useState, useRef } from "react";
import "./ImageUpload.css";

const ImageUpload = ({ onImageSelect, mlValidation }) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
      onImageSelect(file);
    }
  };

  const openCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Camera access denied or unavailable.");
      console.error(err);
      setIsCameraOpen(false);
    }
  };

  const takePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      const file = new File([blob], "captured.jpg", { type: "image/jpeg" });
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
      onImageSelect(file);
    }, "image/jpeg");

    stopCamera();
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
    }
    setIsCameraOpen(false);
  };

  return (
    <div className="image-upload-container">
      <p>📸 Upload or Capture Image</p>

      {!isCameraOpen && (
        <>
          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="gallery-btn"
          >
            📁 Choose from Gallery
          </button>

          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            ref={fileInputRef}
            className="image-input"
          />

          <button type="button" onClick={openCamera} className="camera-btn">
            🎥 Open Camera
          </button>
        </>
      )}

      {isCameraOpen && (
        <div className="camera-container">
          <video ref={videoRef} autoPlay className="camera-view" />
          <button type="button" onClick={takePhoto} className="capture-btn">
            📷 Capture
          </button>
          <button type="button" onClick={stopCamera} className="close-btn">
            ❌ Close
          </button>
          <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>
      )}

      {imagePreview && (
        <div className="preview-section">
          <img src={imagePreview} alt="Preview" className="uploaded-preview" />
          <p className="uploaded-text">✅ Image selected successfully!</p>
          
          {mlValidation?.loading && (
            <div className="ml-validation loading">
              <span className="spinner">⏳</span> Analyzing image with AI...
            </div>
          )}
          
          {mlValidation?.isWaste === true && (
            <div className="ml-validation success">
              <span className="icon">✅</span>
              <strong>Waste Detected!</strong>
              <span className="confidence">Confidence: {mlValidation.confidence}%</span>
            </div>
          )}
          
          {mlValidation?.isWaste === false && (
            <div className="ml-validation error">
              <span className="icon">❌</span>
              <strong>No Waste Detected</strong>
              <span className="confidence">Confidence: {mlValidation.confidence}%</span>
              <p className="hint">Please upload an image showing waste or civic issues</p>
            </div>
          )}
          
          {mlValidation?.error && (
            <div className="ml-validation warning">
              <span className="icon">⚠️</span> AI validation unavailable
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;

