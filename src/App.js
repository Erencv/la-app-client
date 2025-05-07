import "./App.css";
import MockCAS from "./pages/MockCAS";
import { Routes, Route, useSearchParams, useNavigate, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CreateAnnouncement from "./pages/CreateAnnouncement";
import EditAnnouncement from "./pages/EditAnnouncement";
import ApplyPage from "./pages/ApplyPage";
import ApplicantsPage from "./pages/ApplicantsPage";
import { useDispatch, useSelector } from "react-redux";
import LoginCAS from "./pages/LoginCAS";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { startLoginProcess, successLogin, logout, failLogin, setUnreadNotificationCount, increaseUnreadNotificationCountByOne, setStompClient, setPublicSubscription } from "./redux/userSlice";
import { getUnreadNotificationCount, validateLogin } from "./apiCalls";
import CourseApplicantsPage from "./pages/CourseApplicantsPage";
import EditApplyPage from "./pages/EditApplyPage";
import SuccessPage from "./pages/SuccessPage";
import ProfilePage from "./pages/ProfilePage";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import handleError, { handleInfo, handleServerDownError } from "./errors/GlobalErrorHandler";

import TranscriptPage from "./components/transcriptPageComponents/transcriptUploadPage";
import TranscriptInfo from "./components/transcriptPageComponents/transcriptInfoPage";
import QuestionPage from "./components/transcriptPageComponents/transcriptExtraFile";
import EditQuestionPage from "./components/transcriptPageComponents/EditQuestionPage";
import CommitPage from "./components/commitPage/CommitPage";
import EligibilityPage from "./pages/EligibilityPage";
import SockJS from "sockjs-client"
import { Stomp } from "@stomp/stompjs"
import { WebSocketProvider } from "./context/WebSocketContext";

import { useWebSocket } from "./context/WebSocketContext";
import webSocketService from "./components/service/WebSocketService";
import LoadingPage from "./pages/LoadingPage/LoadingPage";
import Forbidden403 from "./403";
import MailingPage from "./components/applicantsTableComponents/MailingPage";
import CASCallback from "./components/CASCallback";




const PauseContext = createContext(null);

export function usePause() {
  return useContext(PauseContext);
}






function App() {
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
  const isLoading = useSelector((state) => state.user.isLoading);
  const isTranscriptUploded = useSelector((state) => state.user.isTranscriptUploded);
  const authToken = useSelector((state) => state.user.jwtToken);

  const isInstructor = useSelector((state) => state.user.isInstructor);
  const dispatch = useDispatch();
  const url = window.location.href;
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const navigate = useNavigate();
  const webSocketContext = useWebSocket();
  const { subscribe, unsubscribe } = webSocketContext;

  const [paused, setPaused] = useState(false);


  useEffect(() => {
    var stompClient = null;

    const handleLogin = (baseUrl, ticket) => {
      validateLogin(baseUrl, ticket)
        .then((result) => {
          // Check if user profile is complete
          const isProfileComplete = result.user.name && 
                                   result.user.surname && 
                                   result.user.universityId;
          
          dispatch(
            successLogin({
              id: result.user.id,
              jwtToken: result.token,
              username: result.user.email,
              name: result.user.name,
              surname: result.user.surname,
              isInstructor: result.user.role === "INSTRUCTOR",
              notificationPreference: result.user.notificationPreference,
              photoUrl: result.user.photoUrl,
              universityId: result.user.universityId
            })
          );

          // Get unread notifications count
          const authToken = result.token;
          getUnreadNotificationCount(authToken)
            .then((r) => {
              dispatch(
                setUnreadNotificationCount({ unreadNotifications: r.count })
              )
            });

          // Connect to WebSocket
          webSocketService.connectWebSocket(authToken);

          const handleNotification = (notification) => {
            dispatch(increaseUnreadNotificationCountByOne());
            handleInfo(notification.description, dispatch);
          };
          const topic = `/user/${result.user.id}/notifications`;

          console.log('calling subscribe: ' + topic);
          webSocketService.subscribe(topic, handleNotification);

          // Clear ticket from URL
          urlParams.delete("ticket");
          const newPath = location.pathname + (urlParams.toString() ? `?${urlParams.toString()}` : '');
          navigate(newPath, { replace: true });

          // Redirect to profile completion if necessary
          if (!isProfileComplete) {
            navigate('/profile/' + result.user.id);
          }
        })
        .catch(error => {
          console.error('Login error:', error);
          dispatch(failLogin());
        });
    };



    if (!isLoggedIn && !isLoading && url.includes("?ticket=")) {
      const ticket = urlParams.get("ticket");
      const baseUrl = url.split("?")[0];
      dispatch(startLoginProcess());

      handleLogin(baseUrl, ticket);
    }

    return () => {
      if (stompClient !== null) {
        stompClient.disconnect();
        dispatch(setStompClient({ stompClient: null }));
      }
    };
  }, [isLoggedIn, isLoading, url, dispatch, navigate, location.pathname, urlParams]);

  // Add this effect to handle hash router redirects from 404.html
  useEffect(() => {
    // Check if we have a hash with path and query
    if (window.location.hash && window.location.hash.startsWith('#/')) {
      const hash = window.location.hash.substring(2); // Remove "#/"
      
      // Check if there's a path with query parameters
      const queryIndex = hash.indexOf('?');
      if (queryIndex !== -1) {
        const path = hash.substring(0, queryIndex);
        const query = hash.substring(queryIndex);
        
        // Check for CAS ticket in the query
        const ticketMatch = query.match(/[?&]ticket=([^&]*)/);
        if (path === 'cas-callback' && ticketMatch) {
          const ticket = ticketMatch[1];
          const serviceUrl = `${window.location.origin}/ens4912/cas-callback`;
          
          // Start login process
          dispatch(startLoginProcess());
          
          // Validate the ticket with backend
          validateLogin(serviceUrl, ticket)
            .then((result) => {
              // Handle successful login (similar code as in handleLogin)
              // Check if user profile is complete
              const isProfileComplete = result.user.name && 
                                       result.user.surname && 
                                       result.user.universityId;
              
              dispatch(
                successLogin({
                  id: result.user.id,
                  jwtToken: result.token,
                  username: result.user.email,
                  name: result.user.name,
                  surname: result.user.surname,
                  isInstructor: result.user.role === "INSTRUCTOR",
                  notificationPreference: result.user.notificationPreference,
                  photoUrl: result.user.photoUrl,
                  universityId: result.user.universityId
                })
              );

              // Get unread notifications count
              const authToken = result.token;
              getUnreadNotificationCount(authToken)
                .then((r) => {
                  dispatch(
                    setUnreadNotificationCount({ unreadNotifications: r.count })
                  )
                });

              // Connect to WebSocket
              webSocketService.connectWebSocket(authToken);

              const handleNotification = (notification) => {
                dispatch(increaseUnreadNotificationCountByOne());
                handleInfo(notification.description, dispatch);
              };
              const topic = `/user/${result.user.id}/notifications`;

              console.log('calling subscribe: ' + topic);
              webSocketService.subscribe(topic, handleNotification);
              
              // Navigate to home or profile completion
              if (!isProfileComplete) {
                navigate('/profile/' + result.user.id, { replace: true });
              } else {
                navigate('/home', { replace: true });
              }
            })
            .catch(error => {
              console.error('Login error:', error);
              dispatch(failLogin());
              navigate('/', { replace: true });
            });
        }
      }
      
      // Clean up the URL by removing the hash
      window.history.replaceState(null, null, '/ens4912/');
    }
  }, [dispatch, navigate]);


  const ProtectedRouteIns = ({ element }) => {
    if (isInstructor) {
      return element;
    }
    return <Forbidden403 />;
  };

  const ProtectedRouteStu = ({ element }) => {
    if (!isInstructor) {
      return element;
    }
    return <Forbidden403 />;
  };

  if (isLoading) {
    return <LoadingPage></LoadingPage>
  }

  return (


    <>
      <div className={`app-content ${isLoading ? 'is-loading' : ''}`}>


        <WebSocketProvider authToken={authToken}>

          <ToastContainer
            containerId="1618"
          />
          <Routes>
            {isLoggedIn ? (
              <>
                {/* not authorized */}
                <Route path="/home" element={<HomePage />} />
                <Route path="*" element={<MockCAS />} />
                <Route path="/success" element={<SuccessPage />} />
                <Route path="/profile/:id" element={<ProfilePage />} />
                <Route path="/403" element={<Forbidden403></Forbidden403>} />
                <Route path="transcriptInfoPage/:id?" element={<TranscriptInfo></TranscriptInfo>}></Route>
                <Route path="/eligibilityPage/:id" element={<EligibilityPage></EligibilityPage>}></Route>


                {/* Authorized for instructor */}
                <Route path="/create-announcement" element={<ProtectedRouteIns element={<CreateAnnouncement />} />} />
                <Route path="/edit-announcement/:id" element={<ProtectedRouteIns element={<EditAnnouncement />} />} />
                <Route path="/applicants" element={<ProtectedRouteIns element={<CourseApplicantsPage />} />} />
                <Route path="/application-of/:appId" element={<ProtectedRouteIns element={<ApplicantsPage />} />} />
                <Route path="/mails/:appId" element={<ProtectedRouteIns element={<MailingPage />} />} />

                {/* Authorized for Student */}
                <Route path="/commit" element={<ProtectedRouteStu element={<CommitPage />} />} />
                <Route path="/apply/:id" element={<ProtectedRouteStu element={<ApplyPage />} />} />
                <Route path="/edit-apply/:id" element={<ProtectedRouteStu element={<EditApplyPage />} />} />
                <Route path="/transcriptUploadPage/:id?" element={<ProtectedRouteStu element={<TranscriptPage></TranscriptPage>} />}></Route>

                <Route path="/questionPage/:id" element={<ProtectedRouteStu element={<QuestionPage></QuestionPage>} />}></Route>
                <Route path="/edit-questionPage/:id" element={<ProtectedRouteStu element={<EditQuestionPage />} />} />


              </>
            ) : (
              <>
                <Route exact path="/" element={<MockCAS></MockCAS>}></Route>
                <Route path="/cas-callback" element={<CASCallback />} />
                <Route path="*" element={<LoginCAS></LoginCAS>}></Route>
                <Route path="/403" element={<Forbidden403></Forbidden403>} />
              </>
            )}
          </Routes>
        </WebSocketProvider>
      </div>
    </>
  );
}

export default App;
