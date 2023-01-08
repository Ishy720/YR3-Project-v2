import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import About from "./pages/About/About";
import Register from "./pages/Register/Register";
import Login from "./pages/Login/Login";
import Discover from "./pages/Discover/Discover";
import Books from "./pages/Books/Books";
import Navbar from "./components/Navbar/Navbar";
import Protected from "./components/ProtectedRoutes/Protected";
import Footer from "./components/Footer/Footer";

//Baseline
function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<Home />} />

        <Route
          path="/discover"
          element={
            <Protected>
              <Discover />
            </Protected>
          }
        />

        <Route
          path="/books"
          element={
            <Protected>
              <Books />
            </Protected>
          }
        />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
