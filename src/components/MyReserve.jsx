import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/MyReserve.css';
import auth,{ db} from '../firebase-config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from "firebase/auth";

const MyReserve = () => {
  const [reservations, setReservations] = useState([]);
  const [user, setUser] = useState(null); // เก็บข้อมูลผู้ใช้ที่ล็อกอิน

  useEffect(() => {
    // ✅ ตรวจสอบสถานะการล็อกอินของผู้ใช้
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchUserReservations(currentUser.email); // ดึงข้อมูลเมื่อผู้ใช้ล็อกอิน
      } else {
        setUser(null);
        setReservations([]); // เคลียร์ข้อมูลถ้าไม่มีผู้ใช้
      }
    });

    return () => unsubscribeAuth(); // ยกเลิกการฟังเมื่อ component ถูก unmount
  }, []);

  // ✅ ฟังก์ชันดึงข้อมูลจาก Firestore เฉพาะของผู้ใช้ที่ล็อกอิน
  const fetchUserReservations = (userEmail) => {
    if (!userEmail) return; // ถ้าไม่มีอีเมล ไม่ต้องทำอะไร

    const q = query(collection(db, 'reservations'), where('userEmail', '==', userEmail));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userReservations = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        data.tables.forEach((tableId) => {
          userReservations.push({
            id: doc.id,
            name: data.reservedBy || "Not specified",
            phone: data.phone || "No number",
            tableNumber: tableId,
            status: data.status || "reserved"
          });
        });
      });

      setReservations(userReservations);
    });

    return unsubscribe;
  };

  return (
    <div className="container-fluid">
      <div className="historyReserve">
        <p>Tables Histories</p>
        <h3>Booking your table</h3>
      </div>

      <div className="table">
        <div className="tableHistory">
          {reservations.length > 0 ? (
            reservations.map((res, index) => (
              <div className="reserve-card" key={index}>
                <h4>Name of booking : {res.name}</h4>
                <p>Telephone number : {res.phone}</p>
                <p>Table number : {res.tableNumber}</p>
                <p>Status: {res.status}</p>
              </div>
            ))
          ) : (
            <h1 className="no-reservations">No reservation yet</h1>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyReserve;
