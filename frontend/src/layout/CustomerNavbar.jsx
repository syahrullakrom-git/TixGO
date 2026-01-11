import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { FaUserCircle, FaSearch, FaBars, FaTimes } from "react-icons/fa";
import { eventApi } from "../api/eventApi";

const Navbar = () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const [keyword, setKeyword] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async () => {
    try {
      const searchResults = await eventApi.search(keyword);
      navigate("/event", { state: { searchResults, keyword } });
    } catch (error) {
      console.error("Error during search:", error);
      navigate("/event", { state: { searchResults: [], keyword } });
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
      {/* Navigasi Kiri */}
      <div className="flex items-center space-x-8">
        <div className="text-xl font-semibold text-[#00CCCC]">TixGO</div>

        <nav className="space-x-6 hidden md:flex">
          {[
            { name: "Dashboard", path: "/" },
            { name: "Acara", path: "/event" },
            ...(token ? [{ name: "Tiketku", path: "/history" }] : []),
            { name: "Tentang Kami", path: "/about-us" },
          ].map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className="relative text-gray-600 hover:text-[#00FFFF] font-medium group"
            >
              {item.name}
              <span className="absolute left-0 bottom-0 w-0 h-1 bg-[#00FFFF] transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Burger Icon & Profile/Login */}
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleMenu}
          className="md:hidden text-gray-600 focus:outline-none"
        >
          {isMenuOpen ? (
            <FaTimes className="text-2xl" />
          ) : (
            <FaBars className="text-2xl" />
          )}
        </button>

        {/* Pencarian dan Profil / Login */}
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder="Cari Acara..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10 pr-4 py-2 h-10 w-64 border rounded-lg outline-none focus:ring-2 focus:ring-[#00FFFF] transition-all"
            />
            <FaSearch
              className="absolute left-3 top-2.5 text-gray-400 cursor-pointer"
              onClick={handleSearch}
            />
          </div>

          {/* Login / Profile Button */}
          {token ? (
            <Link to="/profile" className="text-[#00FFFF] hover:text-teal-400">
              {user.photo_url ? (
                <img
                  src={user.photo_url}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <FaUserCircle className="text-2xl" />
              )}
            </Link>
          ) : (
            <Link
              to="/login"
              className="flex items-center space-x-2 text-black p-2 rounded-full hover:bg-gray-100"
            >
              <span>Login</span>
            </Link>
          )}
        </div>
      </div>

      {/* Dropdown Menu Mobile */}
      <div
        className={`absolute top-16 left-0 w-full bg-white z-10 p-4 space-y-4 shadow-md md:hidden transition-all ease-in-out duration-300 ${
          isMenuOpen ? "block" : "hidden"
        }`}
      >
        {[
          { name: "Dashboard", path: "/" },
          { name: "Acara", path: "/event" },
          ...(token ? [{ name: "Tiketku", path: "/history" }] : []),
          { name: "Tentang Kami", path: "/about-us" },
        ].map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className="text-gray-600 hover:text-[#00FFFF] font-medium group block"
          >
            {item.name}
          </Link>
        ))}

        {/* Search Bar di dalam Hamburger Menu */}
        <div className="relative">
          <input
            type="text"
            placeholder="Cari Acara..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10 pr-4 py-2 h-10 w-64 border rounded-lg outline-none focus:ring-2 focus:ring-[#00FFFF] transition-all"
          />
          <FaSearch
            className="absolute left-3 top-2.5 text-gray-400 cursor-pointer"
            onClick={handleSearch}
          />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
