import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../styles/Body.css';
import { BiBell } from "react-icons/bi";
import { FaLocationDot } from "react-icons/fa6";
import edu1 from '../images/edu1.jpg';
import schedule from "../images/Schedule.jpg";
import { useNavigate } from 'react-router-dom';
import React, { useRef } from 'react';
import video from '../videos/COM EDU Reunion 2025.mp4'

// Import Leaflet สำหรับ OpenStreetMap
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// แก้ปัญหาไอคอนไม่แสดงบน Leaflet.js
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";

const markerIcon = new L.Icon({
  iconUrl: markerIconPng,
  shadowUrl: markerShadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

// 📍 กำหนดตำแหน่งของสถานที่
const center = [13.819781, 100.5153855]; // พิกัดของ "อาคารปฏิบัติการและประลองรวม 44"

const Body = (props) => {
    const navigate = useNavigate();
    const mySectionRef = useRef(null);

    const handleClickReserve = () => {
        if (props.user) {
            navigate('/TableReservation');
        } else {
            window.alert("You must Login!!!");
        }
    };

    const scrollToSection = () => {
        mySectionRef.current.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div>
            <div className="jumbotron text-center py-5">
                <h1 className="display-4" style={{ color: 'white', WebkitTextStroke: '2px #641616' }}>Welcome to COMEDU REUNION</h1>
                <p className="lead" style={{ color: '#641616' }}>Join us for an unforgettable gathering of Computer Education alumni</p>
                <button className="btn btn-light btn-lg" onClick={scrollToSection}>Learn More</button>
            </div>
            <div className="ced">
                <h1 className="notification-title">
                    <BiBell className="notification-icon" /> Introduction Video
                </h1>
                <div className="container my-4">
                    <div className="row justify-content-center">
                        <div className="col-lg-10">
                            <div className="video-container shadow-lg rounded-3 overflow-hidden">
                                <iframe
                                    className="w-100"
                                    height="550"
                                    src={video}
                                    title="COMEDU REUNION Introduction"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                            <div className="text-center mt-4">
                                <h3 className="text-primary">Discover Our Event</h3>
                                <p className="lead text-muted">
                                    Watch our introduction video to learn more about COMEDU REUNION 2025
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div> <hr />
            {/* Notification Section */}
            <div className="ced">
                <h1 className="notification-title">
                    <BiBell className="notification-icon" /> Schedule!!
                </h1>
                <div className="container my-4">
                    <img src={schedule} alt="Schedule" width={500} height={500} />
                </div>
            </div>
            <hr />

            {/* Reservation Section */}
            <div className="ced" ref={mySectionRef} id="target-section">
                <h1 className="notification-title">
                    <BiBell className="notification-icon" /> Reservation!!
                </h1>
                <div className="container my-4">
                    <div className="row">
                        <div className="col-sm-5">
                            <div id="notification" className="carousel slide rounded-carousel shadow-carousel" data-bs-ride="carousel">
                                <div className="carousel-inner">
                                    <div className="carousel-item active">
                                        <img src={edu1} className="d-block w-100 rounded-carousel" alt="Slide 1" />
                                    </div>
                                    <div className="carousel-item">
                                        <img src={edu1} className="d-block w-100 rounded-carousel" alt="Slide 2" />
                                    </div>
                                    <div className="carousel-item">
                                        <img src={edu1} className="d-block w-100 rounded-carousel" alt="Slide 3" />
                                    </div>
                                </div>
                                <button className="carousel-control-prev" type="button" data-bs-target="#notification" data-bs-slide="prev">
                                    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                                </button>
                                <button className="carousel-control-next" type="button" data-bs-target="#notification" data-bs-slide="next">
                                    <span className="carousel-control-next-icon" aria-hidden="true"></span>
                                </button>
                            </div>
                        </div>
                        <div className="col-sm-6 d-flex flex-column ">
                            <h2 className="text-center">COMEDU REUNION 2025</h2>
                            <p className='info'>
                                "The Dream Job I Never Had" <br />
                                📢 Calling all alumni and staff from the Computer Education program <br />
                                Faculty of Technical Education.<br/>
                                King Mongkut’s University of Technology North Bangkok! <br />
                                📅 Event Date: March 15, 2025 <br />
                                ⏰ Time: From 5:00 PM onwards <br />
                                👗 Dress Code: Theme – "The Dream Job I Never Had" <br />
                                ✨ Reserve your table now!!
                            </p>
                            <button className='btn' onClick={handleClickReserve}>Click!!</button>
                        </div>
                    </div>
                </div>
            </div>
            <hr />

            {/* Location Section */}
            <div className="ced">
                <h1 className="notification-title">
                    <FaLocationDot className="notification-icon" /> Location
                </h1>

                <div className="container my-4">
                    {/* 📍 แสดง OpenStreetMap พร้อมการตกแต่ง */}
                    <MapContainer center={center} zoom={18} className="map-container">
                        {/* ใช้แผนที่ OpenStreetMap */}
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution="&copy; OpenStreetMap contributors"
                        />
                        {/* เพิ่ม Marker */}
                        <Marker position={center} icon={markerIcon}>
                            <Popup>📍 Building 44: Laboratory and Practice Facility</Popup>
                        </Marker>
                    </MapContainer>
                </div>
            </div>
            
            <hr />
        </div>
    );
};

export default Body;
