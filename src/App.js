import 'bootstrap/dist/css/bootstrap.min.css';
import { signInWithPopup, GoogleAuthProvider, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import auth from './firebase-config';
import { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';

import Swal from 'sweetalert2';
import Header from './components/Header';
import Body from './components/Body';
import Footer from './components/Footer';
import TableReservation from './components/TableReservation';
import MyReserve from './components/MyReserve';
import PageNotFound from './components/PageNotFound';
import MyProfile from './components/MyProfile.jsx';
import Merchandise from './components/Merchandise.jsx';

// PrivateRoute component
const PrivateRoute = ({ user, children }) => {
  return user ? children : <Navigate to="/home" />;
};

function App() {
  const [user, setUser] = useState(null);
  const provider = new GoogleAuthProvider();

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      setUser(user);
    });
  }, []);

  // ฟังก์ชันล็อกอินด้วย Google
  const signIn = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        setUser(result.user);
        Swal.fire({
          title: 'Welcome!',
          text: 'You have successfully logged in!',
          icon: 'success',
          showConfirmButton: false,
          timer: 2000,
          willClose: () => {
            window.location.href = '';
          },
        });
      })
      .catch((error) => {
        console.log(error.message);
      });
  };

  // ฟังก์ชันสมัครสมาชิกด้วยอีเมลและรหัสผ่าน
  const signUp = () => {
    Swal.fire({
      title: 'Register',
      html: `<input type="email" id="email" class="swal2-input" placeholder="Email">
             <input type="password" id="password" class="swal2-input" placeholder="Password">`,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        const email = Swal.getPopup().querySelector('#email').value;
        const password = Swal.getPopup().querySelector('#password').value;
        if (!email || !password) {
          Swal.showValidationMessage('Please enter email and password');
        }
        return { email, password };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const { email, password } = result.value;
        createUserWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
            setUser(userCredential.user);
            Swal.fire({
              title: 'Registered!',
              text: 'Your account has been created successfully!',
              icon: 'success'
            });
          })
          .catch((error) => {
            console.log(error.message);
            Swal.fire({
              title: 'Error',
              text: error.message,
              icon: 'error'
            });
          });
      }
    });
  };

  // ฟังก์ชันออกจากระบบ
  const signOutUser = () => {
    signOut(auth)
      .then(() => {
        setUser(null);
        Swal.fire({
          title: 'Logged out!',
          text: 'You have successfully logged out!',
          icon: 'info',
          showConfirmButton: false,
          timer: 2000,
        }).then(() => {
          window.location.href = '';
        });
      })
      .catch((error) => {
        console.log(error.message);
      });
  };

  return (
    <BrowserRouter>
      <Header user={user} signOut={signOutUser} signIn={signIn} signUp={signUp} />
      <Routes>
        {/* หน้า home ที่ไม่ต้องการการล็อกอิน */}
        <Route path="" element={<Body user={user}/>} />
        
        {/* หน้า TableReservation ที่ต้องการการล็อกอิน */}
        <Route 
          path="/TableReservation"
          element={
            <PrivateRoute user={user}>
              <TableReservation />
            </PrivateRoute>
          }
        />
        
        {/* หน้า MyReserve ที่ต้องการการล็อกอิน */}
        <Route 
          path='/reserve-table'
          element={
            <PrivateRoute user={user}>
              <MyReserve user={user}/>
            </PrivateRoute>
          }
        />

        {/* หน้า MyProfile ที่ต้องการการล็อกอิน */}
        <Route 
          path='/profile'
          element={
            <PrivateRoute user={user}>
              <MyProfile/>
            </PrivateRoute>
          }
        />

        {/* หน้า Merchandise ที่ต้องการการล็อกอิน */}
        <Route 
          path='/merchandise'
          element={
            <PrivateRoute user={user}>
              <Merchandise/>
            </PrivateRoute>
          }
        />
        
        {/* หน้า Default 404 */}
        <Route path="*" element={<PageNotFound/>} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
