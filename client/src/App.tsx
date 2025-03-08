import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import Home from './pages/Home/Home'
import Dashboard from './pages/Dashboard/Dashboard'
import Error from './pages/Error/Error'
import LoginPage from './pages/Auth/Auth'
import { ForgotPassword } from './pages/Auth/Forgotpassword'
// import userAppStore from './store/store'
// import { apiClient } from './lib/api-client'
// import { GET_USER_INFO } from './utils/constants'
// import { useEffect, useState } from 'react'
// import { SyncLoader } from "react-spinners";


// interface ChildrenProps {
//   children: React.ReactNode;
// }

// const PrivateRoute = ({ children }: ChildrenProps) => {
//   const { userInfo } = userAppStore();
//   const isAuthenticated = !!userInfo;
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     if (userInfo !== undefined) {
//       setIsLoading(false);
//     }
//   }, [userInfo]);

//   if (isLoading) {
//     return <div className=' w-full flex flex-col justify-center items-center h-screen'>
//     <SyncLoader
//     color="#ffffff"
//     size={15} // Size of each dot
//     margin={2} // Margin between dots
//     speedMultiplier={1} // Adjust animation speed
//     aria-label="sync-loading"
//     />
//     </div>;
//   }

//   return isAuthenticated ? children : <Navigate to="/auth" />;
// };


// const AuthRoute = ({ children } : ChildrenProps) => {
//   const { userInfo } = userAppStore();
//   const isAuthenticated = !!userInfo;
//   return isAuthenticated ? <Navigate to="/dashboard"/>: children ;
// }


function App() {
  // const [, setLoading] = useState(false);
  // const { userInfo, setUserInfo } = userAppStore();
  
  // useEffect(() => {
  //   const fetchUserInfo = async () => {
  //     try {
  //       setLoading(true);
  //       const response = await apiClient.get(GET_USER_INFO, { withCredentials: true });
  //       if (response.status === 200 && response.data) {
  //         console.log("User Info", response.data.user);
  //         setUserInfo(response.data.user);
  //       } else {
  //         setUserInfo(null); // Set to null instead of an empty object
  //       }
  //     } catch (error) {
  //       console.error('Error fetching user info', error);
  //       setUserInfo(null); // Ensure userInfo is null on error
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
    
  //   if (!userInfo) {
  //     fetchUserInfo();
  //   } else {
  //     setLoading(false);
  //   }
  // }, [userInfo, setUserInfo]);
  
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path="/auth" element={<LoginPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/404" element={<Error />} />
          <Route path='*' element={<Navigate to ="/404" />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
        </Routes>

      </BrowserRouter>
    </>
  )
}

export default App