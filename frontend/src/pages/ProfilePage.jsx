import React, { useState, useEffect } from "react";
import Navbar from "../layout/CustomerNavbar";
import ProfileSidebar from "../layout/ProfileSidebar";
import { FaCamera } from "react-icons/fa";
import { userApi } from "../api/userApi";
import { toast } from "react-toastify";

const EditProfilePage = () => {
  const [name, setName] = useState("");
  const [photo_url, setPhoto_url] = useState("");
  const [newPhotoFile, setNewPhotoFile] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setName(user.name || "");
      setPhoto_url(user.photo_url || "");
    }
  }, []);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewPhotoFile(file);
      const previewURL = URL.createObjectURL(file);
      setPhoto_url(previewURL);
    }
  };

  const handleUpdate = async () => {
    if (!name) {
      toast.warn("Nama tidak boleh kosong.", { autoClose: 1500 });
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    if (newPhotoFile) {
      formData.append("photoUrl", newPhotoFile); // harus sama dengan multer di backend
    }

    try {
      const response = await userApi.editProfile(formData);
      if (response.success) {
        toast.success("Profil berhasil diperbarui!", { autoClose: 2000 });

        // Update localStorage
        const updatedUser = {
          ...JSON.parse(localStorage.getItem("user")),
          name: response.data.user.name,
          photo_url: response.data.user.photo_url,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        // Update state langsung di UI
        setName(response.data.user.name);
        setPhoto_url(response.data.user.photo_url);
        setNewPhotoFile(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal memperbarui profil", {
        autoClose: 2000,
      });
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleUpdate();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-6xl mx-auto py-8 px-4">
        <h1 className="text-xl font-semibold mb-6">Edit Profil</h1>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Form */}
          <div className="flex-1 bg-white rounded-md shadow-lg p-6">
            <div className="relative w-32 h-32 mx-auto mt-4">
              <img
                src={
                  photo_url ||
                  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcbrL19wroNpkTBQp0pwlbB88EVa0EjOk61g&s"
                }
                alt="Profile"
                className="w-full h-full rounded-full object-cover border-2 border-gray-300"
              />

              <label
                htmlFor="photo-upload"
                className="absolute bottom-0 right-0 bg-[#00cccc] text-white p-2 rounded-full cursor-pointer shadow-md"
              >
                <FaCamera size={20} />
              </label>

              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
            <form className="w-full">
              <label
                htmlFor="name"
                className="block text-gray-700 font-medium mb-2 text-sm"
              >
                Nama Pengguna
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00cccc] text-sm"
                placeholder="Masukkan nama pengguna"
              />
              <button
                type="button"
                onClick={handleUpdate}
                onKeyDown={handleKeyDown}
                className="w-full mt-4 bg-[#00ffff] text-gray-800 py-1 rounded-md text-sm hover:bg-teal-600 transition"
              >
                Perbarui
              </button>
            </form>
          </div>

          <ProfileSidebar />
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;
