/*
  This file is the root React component of the client which serves as the base of the entire client application and 
  serves all subsequent components.
*/

import { Routes, Route, Navigate } from "react-router-dom";
import { useGlobalContext } from "./context";
import "./index.css"

//import pages
import Home from "./pages/Home/Home";
import Register from "./pages/Register/Register";
import Login from "./pages/Login/Login";
import Search from "./pages/Search/Search";
import Inventory from "./pages/Inventory/Inventory";
import ManagerView from "./pages/Manager/ManagerView";
import Related from "./pages/Related/Related";

//import components
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import AddCustomListModal from "./components/AddCustomListModal/AddCustomListModal";
import SelectCustomListModal from "./components/SelectCustomListModal/SelectCustomListModal";
import BookInfoModal from "./components/Books/BookInfoModal";

function App() {

  //import required states
  const { auth, accountType, showCustomListModal, showSelectListModal, showBookInfoModal} = useGlobalContext();

  return (
    <>
      {/* Render the navbar component */}
      <Navbar />

      {/* Render these respective modal overlays if their respective states are true */}
      {showCustomListModal && <AddCustomListModal />}
      {showSelectListModal && <SelectCustomListModal />}
      {showBookInfoModal && <BookInfoModal  />}

      {/* Route declarations */}
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/register" element={auth ? <Navigate to="/searchPage" /> : <Register />} />

        <Route path="/login" element={auth ? <Navigate to="/searchPage" /> : <Login />} />

        <Route path="/manager" element={auth && (accountType === "MANAGER") ? <ManagerView /> : <Home /> } />

        <Route path="/searchPage" element={auth ? <Search /> : <Navigate to="/login" replace />} />

        <Route path="/myBooksPage" element={auth ? <Inventory /> : <Navigate to="/login" replace />} />

        <Route path="/relatedBooksPage" element={auth ? <Related /> : <Navigate to="/login" replace />} />

        <Route path="/*" element={<Home />} />

      </Routes>
      <Footer />
    </>
  );
}

export default App;
