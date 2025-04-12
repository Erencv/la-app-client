import "./App.css";
import { Routes, Route, useSearchParams, useNavigate, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CreateAnnouncement from "./pages/CreateAnnouncement";
import EditAnnouncement from "./pages/EditAnnouncement";
import ApplyPage from "./pages/ApplyPage";
import ApplicantsPage from "./pages/ApplicantsPage";
import { useDispatch, useSelector } from "react-redux";
import LoginCAS from "./pages/LoginCAS";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { startLoginProcess, successLogin, logout as logoutAction, failLogin, setUnreadNotificationCount, increaseUnreadNotificationCountByOne, setStompClient, setPublicSubscription } from "./redux/userSlice";
import { getUnreadNotificationCount, getAuthenticatedUser, validateLogin } from "./apiCalls";
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
    const checkAuthStatus = async () => {
      if (!isLoggedIn) {
        dispatch(startLoginProcess());
        try {
          const userData = await getAuthenticatedUser();
          if (userData) {
            dispatch(
              successLogin({
                id: userData.user.id,
                username: userData.user.email,
                name: userData.user.name,
                surname: userData.user.surname,
                isInstructor: userData.user.role === "INSTRUCTOR",
                notificationPreference: userData.user.notificationPreference,
                photoUrl: userData.user.photoUrl,
                universityId: userData.user.universityId
              })
            );
            getUnreadNotificationCount()
              .then((r) => {
                dispatch(
                  setUnreadNotificationCount({ unreadNotifications: r.count })
                )
              })
            webSocketService.connectWebSocket();
            const handleNotification = (notification) => {
              dispatch(increaseUnreadNotificationCountByOne());
              handleInfo(notification.description, dispatch);
            };
            const topic = `/user/${userData.user.id}/notifications`;
            webSocketService.subscribe(topic, handleNotification);
          } else {
            dispatch(failLogin());
          }
        } catch (error) {
          dispatch(failLogin());
          handleServerDownError(error, dispatch);
        }
      }
    };

    checkAuthStatus();
  }, [dispatch, isLoggedIn]);

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
                <Route path="*" element={<HomePage />} />
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
                <Route exact path="/" element={<LoginCAS></LoginCAS>}></Route>
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
