import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const token = localStorage.getItem("token");

  return (
    <footer className="bg-[#00CCCC] text-white py-8 mt-auto">
      <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between">
        {/* About Us Section */}
        <div className="mb-6 md:mb-0">
          <h4 className="text-lg font-semibold">Tentang TixGO</h4>
          <p className="text-sm mt-2 max-w-xs">
            TixGO adalah platform tiket digital modern untuk organisasi kampus
            yang menawarkan solusi terbaik untuk pengalaman acara Anda. Baik itu
            konser, seminar, atau festival, kami hadir untuk memudahkan!
          </p>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col md:flex-row gap-6">
          <div>
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <nav className="mt-2 flex flex-col gap-2 text-sm">
              {[
                { name: "Dashboard", path: "/" },
                { name: "Acara", path: "/event" },
                ...(token ? [] : [{ name: "Daftar Akun", path: "/register" }]),
              ].map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className="relative text-white hover:text-[#00FFFF] font-medium group"
                >
                  {item.name}
                  <span className="absolute left-0 bottom-0 w-0 h-1 bg-[#00FFFF] transition-all duration-300"></span>
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h4 className="text-lg font-semibold">Support</h4>
            <nav className="mt-2 flex flex-col gap-2 text-sm">
              {[
                ...(token
                  ? []
                  : [{ name: "Lupa Password", path: "/forgot-password" }]),
                { name: "Tentang Kami", path: "/about-us" },
              ].map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className="relative text-white hover:text-[#00FFFF] font-medium group"
                >
                  {item.name}
                  <span className="absolute left-0 bottom-0 w-0 h-1 bg-[#00FFFF] transition-all duration-300"></span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Footer Bottom Section */}
      <div className="border-t border-white mt-8 pt-4 text-sm text-center">
        <p>
          &copy; {new Date().getFullYear()} TixGO. All Rights Reserved. Designed
          by M.S. Akrom.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
