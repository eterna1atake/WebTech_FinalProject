import React, { useState, useEffect, useRef } from 'react';
import '../styles/TableReservation.css';
import qr from '../images/qr.jpg';
import Swal from 'sweetalert2';
import { db } from '../firebase-config'; // ตรวจสอบชื่อไฟล์ config ของคุณให้ถูกต้อง
import { collection, addDoc, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import auth from '../firebase-config';
import emailjs from 'emailjs-com';

const TableReservation = () => {
  // สถานะของโต๊ะแต่ละโต๊ะ (ทุกโต๊ะเป็นสีเขียว - sell)
  const defaultTables = {};
  ['A', 'B', 'C', 'D', 'E', 'F'].forEach((row) => {
    for (let i = 1; i <= 6; i++) {
      const tableId = `${row}${i}`;
      defaultTables[tableId] = { status: 'sell', reservedBy: '' };
    }
  });

  // State สำหรับการจองและข้อมูลผู้จอง
  const [tables, setTables] = useState(defaultTables);
  const [selectedTables, setSelectedTables] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [currentTable, setCurrentTable] = useState(null);
  const [reservationName, setReservationName] = useState('');
  const [reservationPhone, setReservationPhone] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [hoveredTable, setHoveredTable] = useState(null);
  const [fileSelected, setFileSelected] = useState(false);
  const [fileStatus, setFileStatus] = useState('');

  const targetRef = useRef(null);

  // ✅ ดึงข้อมูล `reservations` จาก Firestore และอัปเดตสถานะโต๊ะ
  useEffect(() => {
  const unsubscribe = onSnapshot(collection(db, 'reservations'), (snapshot) => {
    const updatedTables = { ...defaultTables };
    snapshot.forEach((doc) => {
      const data = doc.data();
      data.tables.forEach((tableId) => {
        if (updatedTables[tableId]) {
          updatedTables[tableId].status = 'reserved';
          updatedTables[tableId].reservedBy = data.reservedBy || 'Not specified';
          updatedTables[tableId].phoneNumber = data.phone || 'Not specified'; // ✅ ดึงเบอร์โทรศัพท์มาด้วย
        }
      });
    });
    setTables(updatedTables);
  });

  return () => unsubscribe();
}, []);




  // ฟังก์ชันสำหรับการเลือกโต๊ะ
  const handleTableSelect = (tableId) => {
    const table = tables[tableId];

    // ถ้าโต๊ะนี้มีสถานะเป็น 'sell' ให้แสดงโมดัลกรอกชื่อ
    if (table.status === 'sell') {
      setCurrentTable(tableId);
      setShowNameInput(true);
      return;
    }

    // ถ้าโต๊ะนี้ถูกเลือกอยู่แล้ว ให้ยกเลิกการเลือก
    if (selectedTables.includes(tableId)) {
      setSelectedTables(selectedTables.filter((id) => id !== tableId));
    } else if (table.reservedBy) {
      // ถ้าโต๊ะนี้มีคนจองแล้ว แต่ยังไม่ได้ยืนยัน ให้เพิ่มเข้าไปในรายการที่เลือก
      setSelectedTables([...selectedTables, tableId]);
    }
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
  
    if (reservationName.trim() === '') {
      alert('Please enter the name of the person making the reservation.');
      return;
    }
    if (reservationPhone.trim() === '') {
      alert('Please enter your phone number.');
      return;
    }
  
    // ✅ อัปเดตข้อมูลใน state สำหรับโต๊ะที่เลือก
    const updatedTables = { ...tables };
    updatedTables[currentTable].reservedBy = reservationName;
    updatedTables[currentTable].phoneNumber = reservationPhone; // ✅ บันทึกเบอร์โทรศัพท์ด้วย
    setTables(updatedTables);
  
    setSelectedTables([...selectedTables, currentTable]);
  
    // ล้างข้อมูลและปิดโมดัล
    setReservationName('');
    setReservationPhone('');
    setShowNameInput(false);
    setCurrentTable(null);
  };
  

  // ฟังก์ชันสำหรับสถานะการอัปโหลดไฟล์
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileSelected(true);
      setFileStatus(`Selected files: ${file.name}`);
    } else {
      setFileSelected(false);
      setFileStatus('No file selected yet');
    }
  };

  // ปิดโมดัลกรอกข้อมูล
  const handleCancelNameInput = () => {
    setShowNameInput(false);
    setReservationName('');
    setReservationPhone('');
    setCurrentTable(null);
  };

  // ฟังก์ชันสำหรับยืนยันการจอง (แสดงโมดัลยืนยัน)
  const handleConfirmReservation = () => {
    if (selectedTables.length > 0) {
      setShowConfirmation(true);
    }
  };

  // ฟังก์ชันสำหรับยกเลิกการยืนยัน
  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
  };

const handleConfirm = async () => {
  if (!fileSelected) {
    alert('Please attach the transfer slip before confirming the reservation.');
    return;
  }

  const confirmBooking = window.confirm("Confirm booking!!!");
  if (confirmBooking) {
    Swal.fire({
      title: 'Booking successful',
      text: 'Reserved successfully!',
      icon: 'success'
    });

    try {
      const user = auth.currentUser; // ดึงข้อมูลผู้ใช้ปัจจุบัน
      if (!user) {
        alert("Please login before making a reservation.");
        return;
      }

      // ✅ บันทึกข้อมูลการจอง
      const bookingData = {
        tables: selectedTables,
        reservedBy: selectedTables.map(tableId => tables[tableId].reservedBy)[0] || '',
        phone: selectedTables.map(tableId => tables[tableId].phoneNumber)[0] || '', // ✅ เพิ่มเบอร์โทรศัพท์
        userEmail: user.email, // ✅ เก็บอีเมลผู้จอง
        timestamp: new Date(),
        status: 'reserved'
      };

      // เพิ่มข้อมูลการจองใน Firestore
      await addDoc(collection(db, 'reservations'), bookingData);
      console.log("Booking added successfully.");

      // ส่งข้อมูลการจองผ่าน EmailJS
      const emailTemplateParams = {
        to_email: user.email, // ผู้รับอีเมล
        userName: user.displayName || 'Guest',
        reservedTables: bookingData.tables.join(", "), // ส่งหมายเลขโต๊ะที่จอง
        phone: bookingData.phone,
        reservationTime: bookingData.timestamp.toLocaleString(), // เวลาที่จอง
        status: bookingData.status
      };

      emailjs.send(
        'service_v432ydr', // ใช้ service ID ที่คุณได้จาก EmailJS
        'template_iknwsvk', // ใช้ชื่อ template ของคุณ
        emailTemplateParams,
        'LsfcWD38hg2sIn3Cq' // ใช้ user ID ของคุณจาก EmailJS
      ).then(
        (response) => {
          console.log('Email sent successfully:', response);
        },
        (error) => {
          console.error('Error sending email:', error);
        }
      );

    } catch (error) {
      console.error("Error adding booking:", error);
    }

    setSelectedTables([]);
    setShowConfirmation(false);
    setShowConfetti(true);
  } else {
    alert("The reservation was cancelled.");
    return;
  }
};

  // ฟังก์ชันสำหรับแสดง tooltip เมื่อ hover โต๊ะ
  const handleMouseEnter = (tableId) => {
    setHoveredTable(tableId);
  };

  const handleMouseLeave = () => {
    setHoveredTable(null);
  };

  // ฟังก์ชันสำหรับเลื่อนไปที่ Component
  const handleScroll = () => {
    targetRef.current?.scrollIntoView({ behavior: 'smooth' });
  };


  const renderTable = (tableId) => {
    const table = tables[tableId] || { status: 'sell', reservedBy: '', code: '' };
    const isSelected = selectedTables.includes(tableId);
    let statusClass = table.status;
    if (isSelected) {
      statusClass = 'selected';
    }
  
    return (
      <div
        key={tableId}
        className={`table-button ${statusClass} ${table.reservedBy ? 'has-reservation' : ''}`}
        onClick={() => {
          if (table.status === 'reserved') {
            alert('This table has already been reserved. You cannot choose it again.');
            return;
          }
          handleTableSelect(tableId);
        }}
        onMouseEnter={() => handleMouseEnter(tableId)}
        onMouseLeave={handleMouseLeave}
      >
        <div className="table-id">{tableId}</div>
        <div className="table-code">{table.code}</div>
        {table.info && <div className="table-info">{table.info}</div>}
        {table.reservedBy && <div className="reserved-by">{table.reservedBy}</div>}
        {isSelected && <div className="check-mark">✓</div>}
        {hoveredTable === tableId && (
          <div className="table-tooltip">
            <div>
              Status:{' '}
              {table.status === 'Sell'
                ? 'Empty'
                : table.status === 'Reserved'
                ? 'Full'
                : 'Lock'}
            </div>
            {table.reservedBy && <div>RESERVED BY: {table.reservedBy}</div>}
          </div>
        )}
      </div>
    );
  };
  

  return (
    <div className="table-reservation-container">
      {showConfetti && (
        <div className="confetti-container">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                backgroundColor: [
                  '#a1887f',
                  '#8d6e63',
                  '#795548',
                  '#6d4c41',
                  '#5d4037',
                ][Math.floor(Math.random() * 5)],
              }}
            />
          ))}
        </div>
      )}
      <div className="coffee-decoration top-left"></div>
      <div className="coffee-decoration top-right"></div>
      <div className="coffee-decoration bottom-left"></div>
      <div className="coffee-decoration bottom-right"></div>
      <div className="ribbon">
        <span>COMEDU REUNION 2025</span>
      </div>
      <h1 className="title">COM EDU REUNION 2025 Table Plan</h1>
      <div className="subtitle">Select the table you want to reserve</div>
      <div className="stage-area">
        <center><div className="stage">
          <div className="stage-lights"></div>
          <span>Stage</span>
        </div></center>
      </div>
      <div className="tables-grid">
        <div className="row">{['A1', 'A2', 'A3', 'A4', 'A5', 'A6'].map((tableId) => renderTable(tableId))}</div>
        <div className="row">{['B1', 'B2', 'B3', 'B4', 'B5', 'B6'].map((tableId) => renderTable(tableId))}</div>
        <div className="row">{['C1', 'C2', 'C3', 'C4', 'C5', 'C6'].map((tableId) => renderTable(tableId))}</div>
        <div className="row">{['D1', 'D2', 'D3', 'D4', 'D5', 'D6'].map((tableId) => renderTable(tableId))}</div>
        <div className="row">{['E1', 'E2', 'E3', 'E4', 'E5', 'E6'].map((tableId) => renderTable(tableId))}</div>
        <div className="row">{['F1', 'F2', 'F3', 'F4', 'F5', 'F6'].map((tableId) => renderTable(tableId))}</div>
      </div>
      <div className="legend">
        <div className="legend-item">
          <div className="legend-color locked"></div>
          <div>LOCKED</div>
        </div>
        <div className="legend-item">
          <div className="legend-color sell"></div>
          <div>SELL</div>
        </div>
        <div className="legend-item">
          <div className="legend-color sold_out"></div>
          <div>SOLD OUT</div>
        </div>
        <div className="legend-item">
          <div className="legend-color has-reservation"></div>
          <div>RESERVED</div>
        </div>
      </div>
      <div className="pricing-box">
        <div className="price-header">Price & Package</div>
        <div className="price-item">
          <div className="price-icon">👤</div>
          <div className="price-text">Set 1 person</div>
          <div className="price-amount">350.-</div>
        </div>
        <div className="price-item">
          <div className="price-icon">👥</div>
          <div className="price-text">Table for 10 people</div>
          <div className="price-amount">3,500.-</div>
        </div>
        <div className="price-item reserved">
          <div className="price-text">Advance booking</div>
          <div className="price-amount special">3,200.-</div>
        </div>
      </div>
      <div className="selected-tables-display">
        {selectedTables.length > 0 && (
          <div className="selected-count" >
            <div className="selected-header">Booking details</div>
            <div className="selected-list">
              {selectedTables.map((tableId) => (
                <div className="info-reserve" key={tableId}>
                  <div className="info">
                    <h5>Selected table : {tableId}</h5>
                    <h5>Name of booking : {tables[tableId].reservedBy}</h5>
                    <h5>Tel : {tables[tableId].phoneNumber}</h5>
                  </div>
                  <div className="selected-table-item">
                    {tableId}{' '}
                    {tables[tableId].reservedBy &&
                      `(${tables[tableId].reservedBy})`}
                  </div>
                  <p>!!!Please check your information before confirming your reservation.</p>
                  <hr />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {selectedTables.length > 0 && !showConfirmation && (
        <button className="confirm-button" onClick={handleConfirmReservation}>
          <span className="button-text">
          Confirm booking ({selectedTables.length} Table)
          </span>
          <span className="button-icon">🎫</span>
        </button>
      )}
      {showNameInput && (
        <div className="modal name-input-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2 style={{color:"white"}}>Please fill in the reservation information</h2>
              <div className="table-label">Table {currentTable}</div>
            </div>
            <form onSubmit={handleNameSubmit}>
              <div className="input-group">
                <label htmlFor="reservation-name">Name of booking :</label>
                <input
                  type="text"
                  id="reservation-name"
                  value={reservationName}
                  onChange={(e) => setReservationName(e.target.value)}
                  placeholder="Enter the name of the person booking."
                  autoFocus
                />
              </div>
              <div className="input-group">
                <label htmlFor="reservation-phone">Tel :</label>
                <input
                  type="text"
                  id="reservation-phone"
                  value={reservationPhone}
                  onChange={(e) => {
                    // ตรวจสอบว่าเป็นตัวเลข 10 ตัว
                    const phoneNumber = e.target.value;

                    // ตรวจสอบว่าเป็นตัวเลข 10 หลักและป้องกันการป้อนตัวอักษร
                    if (/^\d{0,10}$/.test(phoneNumber)) {
                      setReservationPhone(phoneNumber);
                    }
                  }}
                  placeholder="Enter your phone number"
                  maxLength="10"  // จำกัดจำนวนตัวอักษรเป็น 10 ตัว
                  pattern="\d{10}" // กำหนดให้ต้องกรอกตัวเลข 10 หลัก
                />
              </div>
              <div className="modal-buttons">
                <button type="submit" className="btn-submit" onClick={handleScroll}>
                  Confirm
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleCancelNameInput}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showConfirmation && (
        <div className="modal confirmation-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2 style={{color:"white"}}>Confirm your booking?</h2>
            </div>
            <div className="confirmation-details">
              <p>You are about to book {selectedTables.length} table.</p>
              <div className="selected-tables-modal">
                {selectedTables.map((tableId) => (
                  <div key={tableId} className="table-chip">
                    <span className="chip-id">{tableId}</span>
                    {tables[tableId].reservedBy && (
                      <span className="chip-name">
                        {tables[tableId].reservedBy}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <div className="price-calculation">
                <div className="calc-row">
                  <span>Price per table</span>
                  <span>3,200 Bath</span>
                </div>
                <div className="calc-row">
                  <span>Number</span>
                  <span>{selectedTables.length} table</span>
                </div>
                <div className="calc-row total">
                  <span>Total</span>
                  <span>
                    {(3200 * selectedTables.length).toLocaleString()} Bath
                  </span>
                </div>
                <div className="payment">
                  <h5 className="text-center">Please make payment.</h5>
                  <div className="payment-qrcode">
                    <img src={qr} alt="QR Code" width={200} />
                  </div>
                  <h5 htmlFor="file-upload" className="text-center">
                  Attach the money transfer slip:
                  </h5>
                  <div className="input-group">
                    <label htmlFor="file-upload" className="file-upload-label">
                      <span style={{color: "white"}}>Select file</span>
                      <input
                        type="file"
                        id="file-upload"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                  {fileStatus && (
                    <div className="file-status">{fileStatus}</div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-buttons">
              <button className="confirm-yes" onClick={handleConfirm}>
              Confirm booking
              </button>
              <button
                className="confirm-no"
                onClick={handleCancelConfirmation}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableReservation;
