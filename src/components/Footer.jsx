import React from 'react';
import "../styles/Footer.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

/* แยก import ตามชุดของไอคอน */
import { faFacebook, faLine } from '@fortawesome/free-brands-svg-icons';    // ไอคอนแบรนด์ (Facebook, Line)
import { faEnvelope } from '@fortawesome/free-regular-svg-icons';          // ไอคอน envelope แบบ regular
import { faPhone } from '@fortawesome/free-solid-svg-icons';               // ไอคอนโทรศัพท์แบบ solid

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* ส่วนติดต่อสื่อสาร */}
        <div className="footer-contact">
          <ul className="footer-list">
            <li className="footer-list-item">
              <a 
                href="https://web.facebook.com/CEDKMUTNB/?_rdc=1&_rdr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="footer-link"
              >
                <FontAwesomeIcon icon={faFacebook} style={{color: "#0056d6"}} size='2xl'/>
                <span>Computer Education</span>
              </a>
            </li>
            <li className="footer-list-item">
              <div className="footer-line">
                <FontAwesomeIcon icon={faLine} style={{color: "#00B900"}} size='2xl'/>
                <span>CED_Kmutnb</span>
              </div>
            </li>
            <li className="footer-list-item">
              <div className="footer-email">
                <FontAwesomeIcon icon={faEnvelope} size='2xl'/>
                <span>ced@fte.kmutnb.ac.th</span>
              </div>
            </li>
            <li className="footer-list-item">
              <div className="footer-phone">
                <FontAwesomeIcon icon={faPhone} size='xl' />
                <span>02-555-2000 ext. 3240</span>
              </div>
            </li>
          </ul>
        </div>
        {/* ส่วน Copyright */}
        <div className="footer-copy">
          <span>
            &copy; {new Date().getFullYear()} Department of Computer Education. All Rights Reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}