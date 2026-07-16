import { Routes, Route, useLocation } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { FloatingObjects } from "./components/FloatingObjects";
import { CustomCursor } from "./components/CustomCursor";
import { CinematicBackground } from "./components/CinematicBackground";

// Pages
import { Landing } from "./pages/Landing";
import { Universe } from "./pages/Universe";
import { ThreeTestPage } from "./pages/ThreeTestPage";

function App() {
  const location = useLocation();
  const isLanding = location.pathname === "/";
  const isPlayground = location.pathname.startsWith("/playground");

  if (isPlayground) {
    return (
      <Routes>
        <Route path="/playground/globe" element={<ThreeTestPage />} />
      </Routes>
    );
  }

  return (
    <main className="relative w-full min-h-screen bg-transparent selection:bg-accent selection:text-black">
      <CustomCursor />
      <CinematicBackground />
      {!isLanding && <FloatingObjects />}
      
      {!isLanding && <Navbar />}

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/universe" element={<Universe />} />
      </Routes>
    </main>
  );
}

export default App;
