import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface AnalysisResult {
  title: string;
  material: string;
  decomposition: string;
  hazards: string;
  hiddenValue: string;
  recycling: string;
  ecoAction: string;
  image?: string;
}

// Initialize Gemini AI
const GEMINI_API_KEY = "AIzaSyDjh0cGJGQGYffl9fC9XVkohWjxUWExObs";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export default function EcoVisionPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraLoading, setCameraLoading] = useState(false);

  const startCamera = async () => {
    console.log("Starting camera...");
    setCameraLoading(true);
    setCameraActive(true);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      console.log("Camera stream obtained:", stream);
      
      // Ensure video element is available and set source
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Force play as soon as possible
        videoRef.current.play().catch(e => console.warn("Video play warning:", e));
      }
      
      setCameraLoading(false);
      
    } catch (err) {
      console.error("Camera access denied:", err);
      alert("Please enable camera access to use EcoVision");
      setCameraLoading(false);
      setCameraActive(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        context.drawImage(videoRef.current, 0, 0);
        const imageData = canvasRef.current.toDataURL("image/jpeg");
        setCapturedImage(imageData);
        
        // Stop camera
        const stream = videoRef.current.srcObject as MediaStream;
        stream?.getTracks().forEach(track => track.stop());
        setCameraActive(false);
        
        // Show preview instead of analyzing immediately
        setShowPreview(true);
      }
    }
  };

  const submitForAnalysis = () => {
    if (capturedImage) {
      setShowPreview(false);
      analyzeImage(capturedImage);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setShowPreview(false);
    startCamera();
  };

  const analyzeImage = async (imageData: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Initialize the Gemini model - use gemini-2.0-flash for image analysis
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      // Convert base64 image to proper format
      const base64Data = imageData.split(',')[1];
      
      const prompt = `Analyze this image for its environmental impact. Provide a detailed environmental analysis in the following JSON format:

{
  "title": "Specific name/type of the object (e.g., 'Plastic Water Bottle', 'Aluminum Can', 'Paper Bag')",
  "material": "Detailed material composition including all components and chemicals",
  "decomposition": "How long it takes to decompose and what happens during decomposition",
  "hazards": "Specific environmental hazards and impacts on ecosystems and wildlife",
  "hiddenValue": "Interesting facts about recyclability, recovery value, or surprising environmental statistics",
  "recycling": "Specific recycling instructions and requirements",
  "ecoAction": "Practical actions to reduce environmental impact"
}

Provide a comprehensive, educational response focusing on environmental science. Be specific and factual.`;

      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg"
        }
      };

      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();
      
      // Parse the JSON response
      let jsonText = text.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '');
      }
      
      const analysisData = JSON.parse(jsonText);
      setAnalysis(analysisData);
      
    } catch (err) {
      console.error("Error analyzing image:", err);
      setError("Failed to analyze image. Please try again.");
      setShowPreview(true);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setCapturedImage(imageData);
        analyzeImage(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetCapture = () => {
    setCapturedImage(null);
    setAnalysis(null);
    setCameraActive(false);
    setShowPreview(false);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-8 px-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-3xl">🌍</div>
            <h1 className="text-3xl md:text-4xl font-bold">EcoVision</h1>
          </div>
          <p className="text-emerald-50 text-lg">AI-Powered Environmental Learning Assistant</p>
          <p className="text-emerald-100 text-sm mt-1">Discover the environmental impact of everyday objects</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <AnimatePresence mode="wait">
          {!capturedImage && !cameraActive ? (
            <motion.div
              key="capture"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Capture & Learn Section */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden"
              >
                <div className="bg-gradient-to-r from-cyan-400 to-emerald-400 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Camera className="w-6 h-6 text-white" />
                    <h2 className="text-2xl font-bold text-white">Capture & Learn</h2>
                  </div>
                </div>

                <div className="p-8">
                  {/* Instructions */}
                  <div className="bg-emerald-50 border-l-4 border-emerald-500 p-6 rounded-lg mb-8">
                    <h3 className="text-lg font-semibold text-emerald-900 mb-4">📋 How to use EcoVision:</h3>
                    <ul className="space-y-3 text-emerald-800">
                      <li className="flex gap-3">
                        <span className="font-bold text-emerald-600">1.</span>
                        <span>Click "Start Camera" to activate your device's camera</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-bold text-emerald-600">2.</span>
                        <span>Point your camera at any environmental object (bottles, cans, paper, etc.)</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-bold text-emerald-600">3.</span>
                        <span>Click "Capture & Analyze" to take a photo</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-bold text-emerald-600">4.</span>
                        <span>Get instant AI-powered insights about environmental impact</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-bold text-emerald-600">5.</span>
                        <span>Use "Try Another Object" to capture and analyze more items</span>
                      </li>
                    </ul>
                  </div>

                  {/* AI Powered Notice */}
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-300 rounded-lg p-6 mb-8">
                    <div className="flex gap-3">
                      <Sparkles className="w-5 h-5 text-purple-700 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-purple-900">Powered by Gemini AI</h4>
                        <p className="text-purple-800 text-sm mt-1">
                          This feature uses Google Gemini's Vision API for real-time environmental analysis. The AI examines captured objects and provides detailed insights about their environmental impact, material composition, and eco-friendly disposal methods.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Camera Section */}
                  {!cameraActive && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button
                          onClick={startCamera}
                          disabled={cameraLoading}
                          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-6 rounded-xl disabled:opacity-50"
                        >
                          <Camera className="w-5 h-5 mr-2" />
                          {cameraLoading ? "Starting Camera..." : "Start Camera"}
                        </Button>

                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-6 rounded-xl"
                        >
                          📁 Upload Image
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={uploadImage}
                          className="hidden"
                        />
                      </div>
                    </div>
                  )}
              </div>
              </motion.div>

              {/* Features */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-emerald-500">
                  <div className="text-3xl mb-3">♻️</div>
                  <h3 className="font-bold text-emerald-900 mb-2">Material Composition</h3>
                  <p className="text-sm text-gray-600">Learn what materials make up everyday objects</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-teal-500">
                  <div className="text-3xl mb-3">🌱</div>
                  <h3 className="font-bold text-teal-900 mb-2">Environmental Impact</h3>
                  <p className="text-sm text-gray-600">Understand decomposition and ecosystem effects</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-cyan-500">
                  <div className="text-3xl mb-3">💡</div>
                  <h3 className="font-bold text-cyan-900 mb-2">Eco Actions</h3>
                  <p className="text-sm text-gray-600">Get practical steps to reduce environmental impact</p>
                </div>
              </motion.div>
            </motion.div>
          ) : cameraActive ? (
            <motion.div
              key="camera"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Camera Preview Box */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden"
              >
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Camera className="w-6 h-6 text-white" />
                      <h2 className="text-2xl font-bold text-white">Camera Preview</h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                      <span className="text-white text-sm font-medium">LIVE</span>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  {/* Camera Frame Container */}
                  <div className="relative bg-black rounded-2xl overflow-hidden border-4 border-emerald-500 shadow-2xl">
                    {/* Camera Preview */}
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full aspect-video object-cover"
                    />
                    
                    {/* Overlay Guide Frame */}
                    <div className="absolute inset-0 pointer-events-none">
                      {/* Corner Brackets */}
                      <div className="absolute top-8 left-8 w-16 h-16 border-t-4 border-l-4 border-white/70"></div>
                      <div className="absolute top-8 right-8 w-16 h-16 border-t-4 border-r-4 border-white/70"></div>
                      <div className="absolute bottom-8 left-8 w-16 h-16 border-b-4 border-l-4 border-white/70"></div>
                      <div className="absolute bottom-8 right-8 w-16 h-16 border-b-4 border-r-4 border-white/70"></div>
                      
                      {/* Center Target */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="w-32 h-32 border-2 border-emerald-400 rounded-full opacity-50 animate-pulse"></div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-emerald-400 rounded-full"></div>
                      </div>
                      
                      {/* Instruction Text */}
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm px-6 py-3 rounded-full">
                        <p className="text-white text-sm font-medium">📸 Position object in center and tap capture</p>
                      </div>
                    </div>
                  </div>
                  
                  <canvas
                    ref={canvasRef}
                    className="hidden"
                    width={1280}
                    height={720}
                  />
                  
                  {/* Camera Controls */}
                  <div className="flex gap-4 mt-6">
                    <Button
                      onClick={() => {
                        const stream = videoRef.current?.srcObject as MediaStream;
                        stream?.getTracks().forEach(track => track.stop());
                        setCameraActive(false);
                      }}
                      className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-6 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                      <X className="w-5 h-5 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      onClick={captureImage}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                      📸 Capture Photo
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ) : showPreview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Photo Preview */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden"
              >
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">📸</div>
                    <h2 className="text-2xl font-bold text-white">Photo Captured</h2>
                  </div>
                </div>

                <div className="p-6">
                  {/* Captured Photo Preview */}
                  <div className="bg-black rounded-2xl overflow-hidden border-4 border-blue-500 shadow-2xl">
                    <img
                      src={capturedImage || ''}
                      alt="Captured preview"
                      className="w-full aspect-video object-cover"
                    />
                  </div>

                  <div className="mt-6 bg-blue-50 border border-blue-300 rounded-lg p-4">
                    <p className="text-blue-900 text-sm">
                      <strong>Review your photo:</strong> Make sure the object is clearly visible and in focus. 
                      Click "Submit for Analysis" to get AI-powered environmental insights, or "Retake Photo" to capture again.
                    </p>
                  </div>

                  {/* Preview Controls */}
                  <div className="flex gap-4 mt-6">
                    <Button
                      onClick={retakePhoto}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                      <RefreshCw className="w-5 h-5 mr-2" />
                      Retake Photo
                    </Button>
                    <Button
                      onClick={submitForAnalysis}
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Submit for Analysis
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Captured Image */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <img
                  src={capturedImage || ''}
                  alt="Captured"
                  className="w-full h-96 object-cover rounded-t-2xl"
                />
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-300 rounded-2xl p-6 text-center"
                >
                  <p className="text-red-700 font-semibold">{error}</p>
                  <Button
                    onClick={() => {
                      setError(null);
                      if (capturedImage) analyzeImage(capturedImage);
                    }}
                    className="mt-4 bg-red-500 hover:bg-red-600 text-white"
                  >
                    Try Again
                  </Button>
                </motion.div>
              )}

              {/* Analysis Result */}
              {isLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-2xl shadow-xl p-8 text-center"
                >
                  <div className="inline-block">
                    <div className="w-12 h-12 rounded-full border-4 border-emerald-200 border-t-emerald-500 animate-spin mb-4 mx-auto" />
                    <p className="text-gray-600 font-semibold">Analyzing environmental impact with Gemini AI...</p>
                    <p className="text-gray-500 text-sm mt-2">This may take a few seconds</p>
                  </div>
                </motion.div>
              ) : analysis ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl shadow-xl overflow-hidden"
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-3xl font-bold mb-2">🔍 Environmental Analysis: {analysis.title}</h2>
                      </div>
                    </div>
                  </div>

                  {/* Analysis Content */}
                  <div className="p-8 space-y-6">
                    {/* Material Composition */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
              cameraActive ? (
            <motion.div
              key="camera"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Camera Preview Box */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden"
              >
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Camera className="w-6 h-6 text-white" />
                      <h2 className="text-2xl font-bold text-white">Camera Preview</h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                      <span className="text-white text-sm font-medium">LIVE</span>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  {/* Camera Frame Container */}
                  <div className="relative bg-black rounded-2xl overflow-hidden border-4 border-emerald-500 shadow-2xl">
                    {/* Camera Preview */}
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full aspect-video object-cover"
                    />
                    
                    {/* Overlay Guide Frame */}
                    <div className="absolute inset-0 pointer-events-none">
                      {/* Corner Brackets */}
                      <div className="absolute top-8 left-8 w-16 h-16 border-t-4 border-l-4 border-white/70"></div>
                      <div className="absolute top-8 right-8 w-16 h-16 border-t-4 border-r-4 border-white/70"></div>
                      <div className="absolute bottom-8 left-8 w-16 h-16 border-b-4 border-l-4 border-white/70"></div>
                      <div className="absolute bottom-8 right-8 w-16 h-16 border-b-4 border-r-4 border-white/70"></div>
                      
                      {/* Center Target */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="w-32 h-32 border-2 border-emerald-400 rounded-full opacity-50 animate-pulse"></div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-emerald-400 rounded-full"></div>
                      </div>
                      
                      {/* Instruction Text */}
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm px-6 py-3 rounded-full">
                        <p className="text-white text-sm font-medium">📸 Position object in center and tap capture</p>
                      </div>
                    </div>
                  </div>
                  
                  <canvas
                    ref={canvasRef}
                    className="hidden"
                    width={1280}
                    height={720}
                  />
                  
                  {/* Camera Controls */}
                  <div className="flex gap-4 mt-6">
                    <Button
                      onClick={() => {
                        const stream = videoRef.current?.srcObject as MediaStream;
                        stream?.getTracks().forEach(track => track.stop());
                        setCameraActive(false);
                      }}
                      className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-6 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                      <X className="w-5 h-5 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      onClick={captureImage}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                      📸 Capture Photo
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ) : showPreview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Photo Preview */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden"
              >
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">📸</div>
                    <h2 className="text-2xl font-bold text-white">Photo Captured</h2>
                  </div>
                </div>

                <div className="p-6">
                  {/* Captured Photo Preview */}
                  <div className="bg-black rounded-2xl overflow-hidden border-4 border-blue-500 shadow-2xl">
                    <img
                      src={capturedImage || ''}
                      alt="Captured preview"
                      className="w-full aspect-video object-cover"
                    />
                  </div>

                  <div className="mt-6 bg-blue-50 border border-blue-300 rounded-lg p-4">
                    <p className="text-blue-900 text-sm">
                      <strong>Review your photo:</strong> Make sure the object is clearly visible and in focus. 
                      Click "Submit for Analysis" to get AI-powered environmental insights, or "Retake Photo" to capture again.
                    </p>
                  </div>

                  {/* Preview Controls */}
                  <div className="flex gap-4 mt-6">
                    <Button
                      onClick={retakePhoto}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                      <RefreshCw className="w-5 h-5 mr-2" />
                      Retake Photo
                    </Button>
                    <Button
                      onClick={submitForAnalysis}
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Submit for Analysis
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ) :           <span className="text-2xl">🔬</span>
                        <h3 className="font-bold text-gray-900 text-lg">Material Composition</h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed ml-8">{analysis.material}</p>
                    </div>

                    {/* Decomposition Impact */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">⏱️</span>
                        <h3 className="font-bold text-gray-900 text-lg">Decomposition Impact</h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed ml-8">{analysis.decomposition}</p>
                    </div>

                    {/* Environmental Hazards */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">⚠️</span>
                        <h3 className="font-bold text-gray-900 text-lg">Environmental Hazards</h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed ml-8">{analysis.hazards}</p>
                    </div>

                    {/* Hidden Value */}
                    <div className="space-y-2 bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">💎</span>
                        <h3 className="font-bold text-gray-900 text-lg">Hidden Value</h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed ml-8 font-semibold">{analysis.hiddenValue}</p>
                    </div>

                    {/* Specialized Recycling */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">♻️</span>
                        <h3 className="font-bold text-gray-900 text-lg">Specialized Recycling</h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed ml-8">{analysis.recycling}</p>
                    </div>

                    {/* Eco Action */}
                    <div className="space-y-2 bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🌱</span>
                        <h3 className="font-bold text-gray-900 text-lg">Eco Action</h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed ml-8 italic">{analysis.ecoAction}</p>
                    </div>

                    {/* Keep Exploring */}
                    <div className="bg-gradient-to-r from-emerald-100 to-teal-100 border border-emerald-300 rounded-lg p-4 mt-8">
                      <p className="text-gray-700 text-sm">
                        <span className="font-semibold">💚 Keep exploring!</span> {' '}
                        <span className="text-gray-600">Every object has an environmental story. Understanding these stories helps us make better choices for our planet.</span>
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : null}

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={resetCapture}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-6 rounded-xl"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Try Another Object
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
