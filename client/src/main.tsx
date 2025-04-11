import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/animations.css";

// Set document title
document.title = "MediTrack - Emergency Response System";

createRoot(document.getElementById("root")!).render(<App />);
