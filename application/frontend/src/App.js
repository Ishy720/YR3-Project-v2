import { Routes, Route, Navigate } from "react-router-dom";
import { useGlobalContext } from "./context";
import "./index.css"
//import pages
import Home from "./pages/Home/Home";
import About from "./pages/About/About";
import Register from "./pages/Register/Register";
import Login from "./pages/Login/Login";
import Discover from "./pages/Discover/Discover";
import Books from "./pages/Books/Books";
import AdminView from "./pages/Admin/AdminView";
import ManagerView from "./pages/Manager/ManagerView";
import Suggested from "./pages/Suggested/Suggested";
import Protected from "./components/ProtectedRoutes/Protected";
import UserProtected from "./components/ProtectedRoutes/UserProtected";
import AdminProtected from "./components/ProtectedRoutes/AdminProtected";
import ManagerProtected from "./components/ProtectedRoutes/ManagerProtected";

//import components
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import AddCustomListModal from "./components/AddCustomListModal/AddCustomListModal";
import SelectCustomListModal from "./components/SelectCustomListModal/SelectCustomListModal";
import BookInfoModal from "./components/Books/BookInfoModal";

//Baseline
function App() {
  const { auth, accountType, showModal, setShowModal, showSelectListModal, showBookInfoModal} =
    useGlobalContext();

  return (
    <>
      <Navbar />
      {showModal && <AddCustomListModal />}
      {showSelectListModal && <SelectCustomListModal />}
      {showBookInfoModal && <BookInfoModal  />}

      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/about" element={<About />} /> */}
        <Route
          path="/register"
          element={auth ? <Navigate to="/discover" /> : <Register />}
        />

        <Route
          path="/login"
          element={auth ? <Navigate to="/discover" /> : <Login />}
        />

        <Route
          path="/admin"
          element={auth && accountType === "ADMIN" ? <AdminView /> : <Home />}
        />

        <Route
          path="/manager"
          element={
            auth && (accountType === "MANAGER" || accountType === "ADMIN") ? <ManagerView /> : <Home />
          }
        />

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

        <Route
          path="/suggested"
          element={
            <Protected>
              <Suggested />
            </Protected>
          }
        />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
