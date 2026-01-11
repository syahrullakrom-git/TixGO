import React from "react";
import Navbar from "../layout/CustomerNavbar";
import Footer from "../layout/Footer";

const AboutUsPage = () => {
  const creators = [
    {
      name: "Muhammad Syahrul Akrom",
      email: "syahrullakrom@gmail.com",
      role: "Fullstack Web Development",
      image: "aku.jpeg",
    },
  ];

  return (
    <div className="flex flex-col bg-[#f0f0f0] min-h-screen">
      <Navbar />
      {/* Hero Section */}
      <header className="bg-[#00CCCC] text-white py-16 text-center">
        <h1 className="text-4xl font-bold">Tentang Kami</h1>
        <p className="mt-4 text-lg max-w-3xl mx-auto">
          Di balik TixGO adalah orang berbakat dan berdedikasi yang selalu
          berusaha memberikan pengalaman terbaik kepada Anda.
        </p>
      </header>

      {/* Creators Section */}
      <section className="py-16 px-6 max-w-screen-xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-12">
          Kenali Developer
        </h2>
        <div
          className=" bg-white rounded-lg shadow-md overflow-hidden
    flex flex-col justify-between
    hover:shadow-lg transform hover:scale-105 transition duration-300
    mx-auto
    md:col-span-2
    lg:col-span-5"
        >
          {creators.map((creator, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col justify-between hover:shadow-lg transform hover:scale-105 transition duration-300"
            >
              {/* Gambar Kreator */}
              <img
                src={creator.image}
                alt={creator.name}
                className="w-full h-48 object-cover"
              />
              {/* Konten Kreator */}
              <div className="p-2 text-center flex-1 flex flex-col justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  {creator.name}
                </h3>
                <p className="text-gray-600 text-sm">{creator.email}</p>
                <p className="text-[#00CCCC] text-sm font-medium">
                  {creator.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutUsPage;
