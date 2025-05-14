import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import auth, { db } from "../firebase-config"; // นำเข้า Firebase
import { doc, getDoc, setDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import '../styles/MyProfile.css';

const MyProfile = () => {
  const currentUser = auth.currentUser; // ดึงข้อมูลผู้ใช้ที่ล็อกอินอยู่

  // ตั้งค่า default จาก Firebase Authentication
  const [userData, setUserData] = useState({
    name: currentUser?.displayName || "",
    email: currentUser?.email || "",
    phone: "",
    address: "",
    profilePicture: currentUser?.photoURL || "",
  });

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  // ดึงข้อมูลเพิ่มเติมจาก Firestore
  useEffect(() => {
    if (currentUser) {
      const fetchUserData = async () => {
        // แสดงตัว loading ขณะรอข้อมูล
        Swal.fire({
          title: 'Loading...',
          text: 'Loading data...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          } 
        });

        const userRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          setUserData((prevData) => ({
            ...prevData,
            ...docSnap.data(), // รวมข้อมูลจาก Firestore
          }));
        } else {
          console.log("No profile found in Firestore, using Firebase Auth data.");
        }

        // ซ่อนตัว loading หลังจากโหลดเสร็จ
        Swal.close();
        setLoading(false);
      };
      fetchUserData();
    }
  }, [currentUser]);

  const handleSaveProfile = async () => {
    if (!currentUser) return;

    // แสดงตัว loading ขณะกำลังบันทึกข้อมูล
    Swal.fire({
      title: 'Saving...',
      text: 'Saving data...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const userRef = doc(db, "users", currentUser.uid);
    await setDoc(userRef, userData, { merge: true });

    // อัปเดตชื่อ และรูปภาพใน Firebase Authentication
    await updateProfile(currentUser, {
      displayName: userData.name,
      photoURL: userData.profilePicture,
    });

    // ปิดตัว loading หลังจากบันทึกเสร็จ
    Swal.close();
    alert("Profile updated successfully!");
    setEditing(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserData({ ...userData, profilePicture: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="profile-wrapper-custom mt-4">
      <h2 className="profile-title-custom">My Profile</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="profile-card-custom">
          <label htmlFor="profile-pic">
            <img
              src={userData.profilePicture || "https://via.placeholder.com/150"}
              alt="Profile"
              className="profile-picture-custom"
            />
          </label>
          {editing && <input type="file" id="profile-pic" onChange={handleImageChange} />}

          <div className="profile-details-custom">
            <label>Name:</label>
            <input
              type="text"
              value={userData.name}
              onChange={(e) => setUserData({ ...userData, name: e.target.value })}
              disabled={!editing}
            />

            <label>Email:</label>
            <input type="email" value={userData.email} disabled />

            <label>Phone:</label>
            <input
              type="text"
              value={userData.phone}
              onChange={(e) => {
                const phone = e.target.value;

                // ใช้ regex เพื่อให้กรอกได้เฉพาะตัวเลข 10 หลัก
                if (/^\d{0,10}$/.test(phone)) {
                  setUserData({ ...userData, phone });
                }
              }}
              disabled={!editing}
              maxLength="10"  // จำกัดจำนวนตัวอักษรเป็น 10 ตัว
              placeholder="Enter phone number"
            />

            <label>Address:</label>
            <input
              type="text"
              value={userData.address}
              onChange={(e) => setUserData({ ...userData, address: e.target.value })}
              disabled={!editing}
            />
          </div>

          {!editing ? (
            <button className="btn-custom btn-edit" onClick={() => setEditing(true)}>
              Edit Profile
            </button>
          ) : (
            <button className="btn-custom btn-save" onClick={handleSaveProfile}>
              Save Profile
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MyProfile;
