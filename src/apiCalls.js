import axios from "axios";
import handleError from "./errors/GlobalErrorHandler.jsx"

const url = window.location.href;
//var apiEndpoint = "http://localhost:8000/api/v1";
const DEBUG_USER_ID = "1234561"; // Consistent user ID for debugging
var apiEndpoint = "http://pro2-dev.sabanciuniv.edu:8000/api/v1";

// Override for local development - comment out for production deployment
// apiEndpoint = "http://localhost:8000/api/v1";
//apiEndpoint = "https://localhost:8000/api/v1";

if (url.indexOf("pro2") === -1) {
  apiEndpoint = "http://localhost:8000/api/v1";
  //apiEndpoint = "https://localhost:8000/api/v1";
}

function getJwtFromCookie() {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1);
    }
    if (cookie.indexOf('jwt=') === 0) {
      return cookie.substring('jwt='.length, cookie.length);
    }
  }
  return null;
}

async function applyToPost(postId, userID, answers) {
  try {
    const token = getJwtFromCookie()
    const results = await axios.post(
      apiEndpoint + "/applicationRequest/student" ,
      { applicationId: postId, answers: answers },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
          "X-User-ID": DEBUG_USER_ID
        }
      }
    );
    return true;
  } catch (error) {
    try {
      handleError(error);
    }
    catch (e) {
      return false
    }
  }
}

async function getAnnouncement(id) {
  try {
    const token = getJwtFromCookie()
    const results = await axios.get(`${apiEndpoint}/applications/${id}`, {
      headers: { 
        "Authorization": "Bearer " + token,
        "X-User-ID": DEBUG_USER_ID
      }
    });

    return results.data;
  } catch (error) {
    return handleError(error);
  }
}

async function getAllAnnouncements() {
  try {
    const token = getJwtFromCookie()
    const results = await axios.get(apiEndpoint + "/applications", {
      headers: { 
        "Authorization": "Bearer " + token,
        "X-User-ID": DEBUG_USER_ID
      }
    });
    return results.data;
  } catch (error) {
    return handleError(error);
  }
}

async function getAllInstructors() {
  try {
    const token = getJwtFromCookie()
    const results = await axios.get(apiEndpoint + "/users/instructors", {
      headers: { 
        "Authorization": "Bearer " + token,
        "X-User-ID": DEBUG_USER_ID
      }
    });
    return results.data;
  } catch (error) {
    return handleError(error);
  }
}

async function getAllAnnouncementsOfInstructor() {
  try {
    const token = getJwtFromCookie()
    const results = await axios.get(apiEndpoint + "/applications/instructor", {
      headers: { 
        "Authorization": "Bearer " + token,
        "X-User-ID": DEBUG_USER_ID
      }
    });
    return results.data;
  } catch (error) {
    return handleError(error);
  }
}

async function getTranscriptInfo() {
  try {
    const token = getJwtFromCookie()
    const results = await axios.get(apiEndpoint + "/transcript/current-transcript-status", {
      headers: { 
        "Authorization": "Bearer " + token,
        "X-User-ID": DEBUG_USER_ID
      }
    });
    return results.data;
  } catch (error) {
    return handleError(error);
  }
}

async function getAllCourses() {
  try {
    const token = getJwtFromCookie()
    const results = await axios.get(apiEndpoint + "/courses", {
      headers: { 
        "Authorization": "Bearer " + token,
        "X-User-ID": DEBUG_USER_ID
      }
    });
    return results.data;
  } catch (error) {
    return handleError(error);
  }
}

function formatDate(dateString) {
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

async function addAnnouncement(
  course_code,
  username,
  lastApplicationDate,
  lastApplicationTime,
  letterGrade,
  workHours,
  details,
  auth_instructors,
  desired_courses,
  questions,
  term,
  isInprogressAllowed,
  isNotTakenAllowed,
  section
) {
  const token = getJwtFromCookie()
  const deadline = formatDate(lastApplicationDate) + " " + lastApplicationTime;

  console.log(letterGrade);
  const authInstructor_ids = auth_instructors.map(
    (user) => user.id
  );

  try {
    const response = await axios.post(apiEndpoint + "/applications", {
      courseCode: course_code,
      previousCourseGrades: desired_courses,
      lastApplicationDate: deadline,
      term: term.term_desc,
      weeklyWorkHours: workHours,
      jobDetails: details,
      authorizedInstructors: authInstructor_ids,
      minimumRequiredGrade: letterGrade,
      desiredCourseGrade: letterGrade,
      questions: questions,
      isInprogressAllowed: isInprogressAllowed,
      isNotTakenAllowed: isNotTakenAllowed,
      section: section?.trim()
    }, {
      headers: { 
        "Authorization": "Bearer " + token,
        "X-User-ID": DEBUG_USER_ID
      }
    });

    return response.data;
  } catch (error) {
    return handleError(error);
  }
}

async function updateAnnouncement(
  id,
  course_code,
  username,
  lastApplicationDate,
  lastApplicationTime,
  letterGrade,
  workHours,
  details,
  auth_instructors,
  desired_courses,
  questions,
  term,
  isInprogressAllowed,
  isNotTakenAllowed,
  section
) {
  const token = getJwtFromCookie();
  const deadline = formatDate(lastApplicationDate) + " " + lastApplicationTime;
  console.log(letterGrade);
  const authInstructor_ids = auth_instructors.map(
    (user) => user.id
  );
  try {
    const response = await axios.put(apiEndpoint + "/applications/" + id, {
      courseCode: course_code,
      previousCourseGrades: desired_courses,
      lastApplicationDate: deadline,
      term: term.term_desc,
      weeklyWorkHours: workHours,
      jobDetails: details,
      authorizedInstructors: authInstructor_ids,
      minimumRequiredGrade: letterGrade,
      desiredCourseGrade: letterGrade,
      questions: questions,
      isInprogressAllowed: isInprogressAllowed,
      isNotTakenAllowed: isNotTakenAllowed,
      section: section?.trim()
    }, {
      headers: { 
        "Authorization": "Bearer " + token,
        "X-User-ID": DEBUG_USER_ID
      }
    });
    return response.data;
  } catch (error) {
    return handleError(error)
  }
}

async function getApplicationsByPost(postID) {
  try {
    const results = await axios.get(
      apiEndpoint + "/listPostApplication/" + postID,
      {
        headers: { "X-User-ID": DEBUG_USER_ID }
      }
    );
    return results.data;
  } catch (error) { return handleError(error); }
}

async function getApplicationByUsername(username) {
  try {
    const results = await axios.get(
      apiEndpoint + "/listStudentApplication/" + username,
      {
        headers: { "X-User-ID": DEBUG_USER_ID }
      }
    );
    return results.data;
  } catch (error) { return handleError(error); }
}

async function getApplicationRequestsByStudentId(studentId, page) {
  try {
    const token = getJwtFromCookie()
    
    const results = await axios.get(
      apiEndpoint + "/applicationRequest/student/" + studentId + "?page="+ page +"&size=5", {
      headers: { 
        "Authorization": "Bearer " + token,
        "X-User-ID": DEBUG_USER_ID
      }
    }
    );
    return results.data;
  } catch (error) { return handleError(error); }
}

async function getStudentLaHistory(studentId,applicationId, page) {
  try {
    const token = getJwtFromCookie()

    const results = await axios.post(
      apiEndpoint + "/applicationRequest/student/la_history" + "?page="+ page +"&size=5", {
        studentId: studentId,
        applicationId : parseInt(applicationId)
      },{
      headers: { 
        "Authorization": "Bearer " + token,
        "X-User-ID": DEBUG_USER_ID
      }
    }
    );
    return results.data;
  } catch (error) { return handleError(error); }
}

async function getApplicationRequestsByApplicationId(applicationId) {
  try {
    const token = getJwtFromCookie()
    const results = await axios.get(
      apiEndpoint + "/applications/" + applicationId + "/applicationRequests", {
      headers: { 
        "Authorization": "Bearer " + token,
        "X-User-ID": DEBUG_USER_ID
      }
    }
    );
    return results.data;
  } catch (error) { return handleError(error); }
}

async function updateApplicationById(
  applicationId,
  username,
  grade,
  faculty,
  working_hours,
  status = "Applied",
  post_id,
  answers,
  transcript
) {
  try {
    const token = getJwtFromCookie()
    var bodyFormData = new FormData();
    bodyFormData.append("student_username", username);
    bodyFormData.append("working_hours", working_hours);
    bodyFormData.append("post_id", post_id);
    bodyFormData.append("answers", JSON.stringify(answers));
    bodyFormData.append("status", status);
    bodyFormData.append("grade", 0);
    bodyFormData.append("faculty", "-");
    bodyFormData.append("transcript", transcript);
    console.log(transcript);
    const results = await axios.post(
      apiEndpoint + "/updateApplication/" + applicationId,
      bodyFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": "Bearer " + token,
          "X-User-ID": DEBUG_USER_ID
        }
    }
    );
    return results.data;
  } catch (error) { return handleError(error); }
}

async function deleteApplicationById(applicationId) {
  try {
    const token = getJwtFromCookie()
    const results = await axios.delete(
      apiEndpoint + "/applications/" + applicationId, {
      headers: { 
        "Authorization": "Bearer " + token,
        "X-User-ID": DEBUG_USER_ID
      }
    }
    );
    return
  } catch (error) { return handleError(error); }
}

async function validateLogin(serviceUrl, ticket) {
  try {
    // DEBUG MODE: Bypass authentication for testing
    const debugMode = true; // Set to true to bypass authentication
    
    if (debugMode) {
      console.log("DEBUG MODE: Bypassing authentication - STUDENT VERSION");
      // Create a mock JWT token with 1 day expiry
      const mockToken = "debug_token_for_testing_only";
      const expiryDays = 1;
      const now = new Date();
      now.setTime(now.getTime() + (expiryDays * 24 * 60 * 60 * 1000));
      const expires = "expires=" + now.toUTCString();
      document.cookie = "jwt=" + mockToken + ";" + expires + ";path=/";
      
      // Return mock data - STUDENT ROLE FIXED
      return {
        token: mockToken,
        user: {
          id: DEBUG_USER_ID, // Use the same ID as X-User-ID header
          username: "student_user",
          email: "student@example.com",
          role: "STUDENT", // Fixed to STUDENT for this deployment
          name: "Student",
          surname: "User"
        }
      };
    }
    
    // Normal authentication flow
    const isValidUrl = isValidURL(serviceUrl);
    if (!isValidUrl) {
      throw new Error("The service URL is not valid.");
    }

    const result = await axios.post(apiEndpoint + "/auth/authentication", {
      serviceUrl: serviceUrl,
      ticket: ticket,
    }, {
      headers: { "X-User-ID": DEBUG_USER_ID }
    });

    console.log(result.data);
    
    const expiryDays = 1;
    const now = new Date();
    now.setTime(now.getTime() + (expiryDays * 24 * 60 * 60 * 1000));
    const expires = "expires=" + now.toUTCString();
    document.cookie = "jwt=" + result.data.token + ";" + expires + ";path=/";

    return result.data;
  } catch (error) {
    return handleError(error);
  }
}

function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    //return handleError(error);
    return false;
  }
}

async function getTranscript(applicationId) {
  try {
    const result = await axios.get(apiEndpoint + "/transcript/get-transcript-file/" + applicationId, {
      headers: { "X-User-ID": DEBUG_USER_ID }
    });
    return result.data;
  } catch (error) { return handleError(error); }
}

async function getTerms() {
  try {
    
    // const result = await axios.get( "/terms", {
    //   headers: { "Authorization": "Basic dGVybXNfYXBpOmF5WV8zNjZUYTE=" }
    // });

    const asd = [{
      "term_code": "202502",
      "term_desc": "Spring 2025-2026",
      "term_start_date": "2026-01-15",
      "term_end_date": "2026-06-12",
      "aid_year": "2526",
      "academic_year": "2025",
      "is_active": "0"
      },
      {
      "term_code": "202501",
      "term_desc": "Fall 2025-2026",
      "term_start_date": "2025-09-01",
      "term_end_date": "2026-01-14",
      "aid_year": "2526",
      "academic_year": "2025",
      "is_active": "0"
      },
      {
      "term_code": "202403",
      "term_desc": "Summer 2024-2025",
      "term_start_date": "2025-06-13",
      "term_end_date": "2025-08-31",
      "aid_year": "2425",
      "academic_year": "2024",
      "is_active": "0"
      },
      {
      "term_code": "202402",
      "term_desc": "Spring 2024-2025",
      "term_start_date": "2025-01-16",
      "term_end_date": "2025-06-12",
      "aid_year": "2425",
      "academic_year": "2024",
      "is_active": "1"
      },
      {
      "term_code": "202401",
      "term_desc": "Fall 2024-2025",
      "term_start_date": "2024-09-03",
      "term_end_date": "2025-01-15",
      "aid_year": "2425",
      "academic_year": "2024",
      "is_active": "0"
      },
      {
      "term_code": "202303",
      "term_desc": "Summer 2023-2024",
      "term_start_date": "2024-06-13",
      "term_end_date": "2024-09-02",
      "aid_year": "2324",
      "academic_year": "2023",
      "is_active": "0"
      },
      {
      "term_code": "202302",
      "term_desc": "Spring 2023-2024",
      "term_start_date": "2024-01-25",
      "term_end_date": "2024-06-12",
      "aid_year": "2324",
      "academic_year": "2023",
      "is_active": "0"
      },
      {
      "term_code": "202301",
      "term_desc": "Fall 2023-2024",
      "term_start_date": "2023-09-05",
      "term_end_date": "2024-01-24",
      "aid_year": "2324",
      "academic_year": "2023",
      "is_active": "0"
      },
      {
      "term_code": "202203",
      "term_desc": "Summer 2022-2023",
      "term_start_date": "2023-06-15",
      "term_end_date": "2023-09-04",
      "aid_year": "2223",
      "academic_year": "2022",
      "is_active": "0"
      },
      {
      "term_code": "202202",
      "term_desc": "Spring 2022-2023",
      "term_start_date": "2023-01-26",
      "term_end_date": "2023-06-14",
      "aid_year": "2223",
      "academic_year": "2022",
      "is_active": "0"
      },
      {
      "term_code": "202201",
      "term_desc": "Fall 2022-2023",
      "term_start_date": "2022-09-09",
      "term_end_date": "2023-01-25",
      "aid_year": "2223",
      "academic_year": "2022",
      "is_active": "0"
      },
      {
      "term_code": "202103",
      "term_desc": "Summer 2021-2022",
      "term_start_date": "2022-06-29",
      "term_end_date": "2022-09-08",
      "aid_year": "2122",
      "academic_year": "2021",
      "is_active": "0"
      },
      {
      "term_code": "202102",
      "term_desc": "Spring 2021-2022",
      "term_start_date": "2022-01-27",
      "term_end_date": "2022-06-28",
      "aid_year": "2122",
      "academic_year": "2021",
      "is_active": "0"
      },
      {
      "term_code": "202101",
      "term_desc": "Fall 2021-2022",
      "term_start_date": "2021-08-27",
      "term_end_date": "2022-01-26",
      "aid_year": "2122",
      "academic_year": "2021",
      "is_active": "0"
      },
      {
      "term_code": "202003",
      "term_desc": "Summer 2020-2021",
      "term_start_date": "2021-06-17",
      "term_end_date": "2021-08-26",
      "aid_year": "2021",
      "academic_year": "2020",
      "is_active": "0"
      },
      {
      "term_code": "202002",
      "term_desc": "Spring 2020-2021",
      "term_start_date": "2021-02-05",
      "term_end_date": "2021-06-16",
      "aid_year": "2021",
      "academic_year": "2020",
      "is_active": "0"
      },
      {
      "term_code": "202001",
      "term_desc": "Fall 2020-2021",
      "term_start_date": "2020-08-25",
      "term_end_date": "2021-02-04",
      "aid_year": "2021",
      "academic_year": "2020",
      "is_active": "0"
      },
      {
      "term_code": "201903",
      "term_desc": "Summer 2019-2020",
      "term_start_date": "2020-06-08",
      "term_end_date": "2020-08-24",
      "aid_year": "1920",
      "academic_year": "2019",
      "is_active": "0"
      },
      {
      "term_code": "201902",
      "term_desc": "Spring 2019-2020",
      "term_start_date": "2020-01-09",
      "term_end_date": "2020-06-07",
      "aid_year": "1920",
      "academic_year": "2019",
      "is_active": "0"
      },
      {
      "term_code": "201901",
      "term_desc": "Fall 2019-2020",
      "term_start_date": "2019-08-28",
      "term_end_date": "2020-01-08",
      "aid_year": "1920",
      "academic_year": "2019",
      "is_active": "0"
      },
      {
      "term_code": "201803",
      "term_desc": "Summer 2018-2019",
      "term_start_date": "2019-06-11",
      "term_end_date": "2019-08-27",
      "aid_year": "1819",
      "academic_year": "2018",
      "is_active": "0"
      },
      {
      "term_code": "201802",
      "term_desc": "Spring 2018-2019",
      "term_start_date": "2019-01-15",
      "term_end_date": "2019-06-10",
      "aid_year": "1819",
      "academic_year": "2018",
      "is_active": "0"
      },
      {
      "term_code": "201801",
      "term_desc": "Fall 2018-2019",
      "term_start_date": "2018-08-17",
      "term_end_date": "2019-01-14",
      "aid_year": "1819",
      "academic_year": "2018",
      "is_active": "0"
      },
      {
      "term_code": "201703",
      "term_desc": "Summer 2017-2018",
      "term_start_date": "2018-06-05",
      "term_end_date": "2018-08-16",
      "aid_year": "1718",
      "academic_year": "2017",
      "is_active": "0"
      },
      {
      "term_code": "201702",
      "term_desc": "Spring 2017-2018",
      "term_start_date": "2018-01-09",
      "term_end_date": "2018-06-04",
      "aid_year": "1718",
      "academic_year": "2017",
      "is_active": "0"
      },
      {
      "term_code": "201701",
      "term_desc": "Fall 2017-2018",
      "term_start_date": "2017-08-25",
      "term_end_date": "2018-01-08",
      "aid_year": "1718",
      "academic_year": "2017",
      "is_active": "0"
      },
      {
      "term_code": "201603",
      "term_desc": "Summer 2016-2017",
      "term_start_date": "2017-06-06",
      "term_end_date": "2017-08-24",
      "aid_year": "1617",
      "academic_year": "2016",
      "is_active": "0"
      },
      {
      "term_code": "201602",
      "term_desc": "Spring 2016-2017",
      "term_start_date": "2017-01-17",
      "term_end_date": "2017-06-05",
      "aid_year": "1617",
      "academic_year": "2016",
      "is_active": "0"
      },
      {
      "term_code": "201601",
      "term_desc": "Fall 2016-2017",
      "term_start_date": "2016-08-23",
      "term_end_date": "2017-01-16",
      "aid_year": "1617",
      "academic_year": "2016",
      "is_active": "0"
      },
      {
      "term_code": "201503",
      "term_desc": "Summer 2015-2016",
      "term_start_date": "2016-06-13",
      "term_end_date": "2016-08-22",
      "aid_year": "1516",
      "academic_year": "2015",
      "is_active": "0"
      },
      {
      "term_code": "201502",
      "term_desc": "Spring 2015-2016",
      "term_start_date": "2016-01-15",
      "term_end_date": "2016-06-12",
      "aid_year": "1516",
      "academic_year": "2015",
      "is_active": "0"
      },
      {
      "term_code": "201501",
      "term_desc": "Fall 2015-2016",
      "term_start_date": "2015-08-26",
      "term_end_date": "2016-01-14",
      "aid_year": "1516",
      "academic_year": "2015",
      "is_active": "0"
      },
      {
      "term_code": "201403",
      "term_desc": "Summer 2014-2015",
      "term_start_date": "2015-06-15",
      "term_end_date": "2015-08-25",
      "aid_year": "1415",
      "academic_year": "2014",
      "is_active": "0"
      }];

    return asd;
  } catch (error) { return handleError(error); }
}

async function logout(token) {
  try {
    const headers = {
      'Authorization': `Bearer ${token}`,
      'X-User-ID': DEBUG_USER_ID
    };

    const response = await axios.get(apiEndpoint + "/auth/logout", { headers });

    return response.data;
  } catch (error) {
    return handleError(error);
  }
}

async function postTranscript(formData) {
  try {
    const token = getJwtFromCookie()
    const result = await axios.post(apiEndpoint + "/transcript/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "Authorization": "Bearer " + token,
        "X-User-ID": DEBUG_USER_ID
      }
    });
    return result.data;
  } catch (error) { return handleError(error); }
}

async function getCurrentTranscript(studentId) {
  try {
    const token = getJwtFromCookie()
    const result = await axios.get(apiEndpoint + "/transcript/get-current-transcript/" + studentId, {
      headers: { 
        "Authorization": "Bearer " + token,
        "X-User-ID": DEBUG_USER_ID
      }
    });
    return result.data;
  } catch (error) { }
}

async function getStudentCourseGrades() {
  try {
    const token = getJwtFromCookie()

    const result = await axios.get(apiEndpoint + "/users/previous-grades", {
      headers: { 
        "Authorization": "Bearer " + token,
        "X-User-ID": DEBUG_USER_ID
      }
    });
    return result.data;
  } catch (error) { }
}

async function getCourseGrades(courseIds,studentId) {
  try {
    const token = getJwtFromCookie()
    const result = await axios.post(
      apiEndpoint + "/transcript/course-grades/" + studentId,
      { courses: courseIds },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
          "X-User-ID": DEBUG_USER_ID
        }
      }
    );

    return result.data;
  } catch (error) { }
}

async function updateApplicationRequestStatus(applicationRequestId, status) {
  try {
    const token = getJwtFromCookie()
    const result = await axios.put(
      apiEndpoint + "/applicationRequest/" + applicationRequestId + "/status",
      { status: status },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
          "X-User-ID": DEBUG_USER_ID
        }
      }
    );

    return result.data;
  } catch (error) { handleError(error) }
}

async function updateApplicationRequestStatusMultiple(statusList) {
  try {
    const token = getJwtFromCookie()
    const result = await axios.put(
      apiEndpoint + "/applicationRequest/status",
      statusList ,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
          "X-User-ID": DEBUG_USER_ID
        }
      }
    );

    return result.data;
  } catch (error) { handleError(error) }
}

async function getApplicationRequestById(applicationRequestId) {
  try {
    const token = getJwtFromCookie()
    const result = await axios.get(
      apiEndpoint + "/applicationRequest/" + applicationRequestId, {
      headers: { 
        "Authorization": "Bearer " + token,
        "X-User-ID": DEBUG_USER_ID
      }
    }
    );
    console.log(result.data);
    return result.data;
  } catch (error) { handleError(error) }
}

async function updateApplicationRequest(applicationRequestId, applicationId, studentId, answers) {
  try {
    const token = getJwtFromCookie()
    const result = await axios.put(
      apiEndpoint + "/applicationRequest/student/update/" + applicationRequestId,
      { applicationId: applicationId, answers: answers },
      {
        headers: { 
          "Authorization": "Bearer " + token,
          "X-User-ID": DEBUG_USER_ID
        }
      }
    );

    return true;
  } catch (error) {
    try {
      handleError(error);
    }
    catch (e) {
      return false
    }
  }
}

async function checkStudentEligibility(applicationId) {
  try {
    const token = getJwtFromCookie()
    const result = await axios.post(
      apiEndpoint + "/applicationRequest/student/checkEligibility/" + applicationId,
      {},
      {
        headers: { 
          "Authorization": "Bearer " + token,
          "X-User-ID": DEBUG_USER_ID
        }
      }
    );

    return result.data;
  } catch (error) {
    handleError(error)
  }
}

async function finalizeStatus(appId, accMail="", rejMail=""){
  try {
    const token = getJwtFromCookie()
    const result = await axios.put(
      apiEndpoint + "/applications/" + appId + "/finalizeStatus",
      {acceptMail: accMail, rejectMail: rejMail},
      {
        headers: { 
          "Authorization": "Bearer " + token,
          "Content-Type": "application/json",
          "X-User-ID": DEBUG_USER_ID
         }
      }
    );

    return result.data;
  } catch (error) {
    handleError(error)
  }
}

async function getNotifications() {
  try {
    const token = getJwtFromCookie()
    const result = await axios.get(
      apiEndpoint + "/notifications",
      {
        headers: { 
          "Authorization": "Bearer " + token,
          "X-User-ID": DEBUG_USER_ID
        }
      }
    );

    return result.data;
  } catch (error) {
    handleError(error)
  }
}

async function changeNotificationStatus(requestData){
  try {
    const token = getJwtFromCookie()
    const result = await axios.put(
      apiEndpoint + "/notifications",
      {
        "notificationChanges": requestData
      },
      {
        headers: { 
          "Authorization": "Bearer " + token,
          "X-User-ID": DEBUG_USER_ID
        }
      }
    );

    return result.data;
  } catch (error) {
    handleError(error)
  }
}

async function changeNotificationPreferences(requestData){
  try {
    const token = getJwtFromCookie()
    const result = await axios.put(
      apiEndpoint + "/notifications/preferences",
      requestData,
      {
        headers: { 
          "Authorization": "Bearer " + token,
          "X-User-ID": DEBUG_USER_ID
        }
      }
    );

    return result.data;
  } catch (error) {
    handleError(error)
  }
}

async function getUnreadNotificationCount(token) {
  try {
    const result = await axios.get(
      apiEndpoint + "/notifications/unread",
      {
        headers: { 
          "Authorization": "Bearer " + token,
          "X-User-ID": DEBUG_USER_ID
        }
      }
    );

    return result.data;
  } catch (error) {
    handleError(error)
  }
}

async function addFollowerToApplication(applicationId){
  try {
    const token = getJwtFromCookie()
    const result = await axios.put(
      apiEndpoint + "/applications/student/" + applicationId + "/followers/add",
      {},
      {
        headers: { 
          "Authorization": "Bearer " + token,
          "X-User-ID": DEBUG_USER_ID
        }
      }
    );

    return result.data;
  } catch (error) {
    handleError(error)
  }
}

async function removeFollowerFromApplication(applicationId){
  try {
    const token = getJwtFromCookie()
    const result = await axios.put(
      apiEndpoint + "/applications/student/" + applicationId + "/followers/remove",
      {},
      {
        headers: { 
          "Authorization": "Bearer " + token,
          "X-User-ID": DEBUG_USER_ID
        }
      }
    );

    return result.data;
  } catch (error) {
    handleError(error)
  }
}

async function getApplicationsByFollower(){
  try {
    const token = getJwtFromCookie()
    const result = await axios.get(
      apiEndpoint + "/applications/byFollowers",
      {
        headers: { 
          "Authorization": "Bearer " + token,
          "X-User-ID": DEBUG_USER_ID
        }
      }
    );

    return result.data;
  } catch (error) {
    handleError(error)
  }
}

async function withdrawApplication(applicationReqId){
  try {
    const token = getJwtFromCookie()
    const result = await axios.put(
      apiEndpoint + "/applicationRequest/withdraw/" + applicationReqId,
      {},
      {
        headers: { 
          "Authorization": "Bearer " + token,
          "X-User-ID": DEBUG_USER_ID
        }
      }
    );

    return result.data;
  } catch (error) {
    handleError(error)
  }
}

async function updateWorkHour(applicationReqId, duration){
  try {
    const token = getJwtFromCookie()
    const result = await axios.put(
      apiEndpoint + "/applicationRequest/updateWorkHour/" + applicationReqId + "?duration=" + duration,
      {},
      {
        headers: { 
          "Authorization": "Bearer " + token,
          "X-User-ID": DEBUG_USER_ID
        }
      }
    );

    return result.data;
  } catch (error) {
    handleError(error)
  }
}

async function acceptAllRequestByAppId(applicationId){
  try {
    const token = getJwtFromCookie()
    const result = await axios.put(
      apiEndpoint + "/applicationRequest/" + applicationId + "/accept-all",
      {},
      {
        headers: { 
          "Authorization": "Bearer " + token,
          "X-User-ID": DEBUG_USER_ID
        }
      }
    );

    return result.data;
  } catch (error) {
    handleError(error)
  }
}

async function rejectAllRequestByAppId(applicationId){
  try {
    const token = getJwtFromCookie()
    const result = await axios.put(
      apiEndpoint + "/applicationRequest/" + applicationId + "/reject-all",
      {},
      {
        headers: { 
          "Authorization": "Bearer " + token,
          "X-User-ID": DEBUG_USER_ID
        }
      }
    );

    return result.data;
  } catch (error) {
    handleError(error)
  }
}

async function commitAppReq(appReqId){
  try {
    const token = getJwtFromCookie()
    const result = await axios.put(
      apiEndpoint + "/applicationRequest/" + appReqId + "/commit",
      {},
      {
        headers: { 
          "Authorization": "Bearer " + token,
          "X-User-ID": DEBUG_USER_ID
        }
      }
    );

    return result.data;
  } catch (error) {
    handleError(error)
  }
}

async function forgivenAppReq(appReqId){
  try {
    const token = getJwtFromCookie()
    const result = await axios.put(
      apiEndpoint + "/applicationRequest/" + appReqId + "/uncommit",
      {},
      {
        headers: { 
          "Authorization": "Bearer " + token,
          "X-User-ID": DEBUG_USER_ID
        }
      }
    );

    return result.data;
  } catch (error) {
    handleError(error)
  }
}

async function updateAppEmail(appId, data){
  try {
    const token = getJwtFromCookie()
    const result = await axios.put(
      apiEndpoint + "/applications/" + appId + "/mailUpdate",
      { acceptMail: data.acceptEmail, rejectMail: data.rejectEmail },
      {
        headers: { 
          "Authorization": "Bearer " + token,
          "X-User-ID": DEBUG_USER_ID
        }
      }
    );

    return result.data;
  } catch (error) {
    handleError(error)
  }
}

async function resetCommitmentofAppReq(appReqId){
  try {
    const token = getJwtFromCookie()
    const result = await axios.put(
      apiEndpoint + "/applicationRequest/instructor/resetCommitment/" + appReqId,
      {},
      {
        headers: { 
          "Authorization": "Bearer " + token,
          "X-User-ID": DEBUG_USER_ID
        }
      }
    );

    return result.data;
  } catch (error) {
    handleError(error)
  }
}

async function redFlagAppReq(appReqId){
  try {
    const token = getJwtFromCookie()
    const result = await axios.put(
      apiEndpoint + "/applicationRequest/instructor/redFlag/" + appReqId,
      {},
      {
        headers: { 
          "Authorization": "Bearer " + token,
          "X-User-ID": DEBUG_USER_ID
        }
      }
    );

    return result.data;
  } catch (error) {
    handleError(error)
  }
}

async function unFlagAppReq(appReqId){
  try {
    const token = getJwtFromCookie()
    const result = await axios.put(
      apiEndpoint + "/applicationRequest/instructor/unRedFlag/" + appReqId,
      {},
      {
        headers: { 
          "Authorization": "Bearer " + token,
          "X-User-ID": DEBUG_USER_ID
        }
      }
    );

    return result.data;
  } catch (error) {
    handleError(error)
  }
}

export {
  updateApplicationRequestStatusMultiple,
  acceptAllRequestByAppId,
  rejectAllRequestByAppId,
  getUnreadNotificationCount,
  changeNotificationPreferences,
  changeNotificationStatus,
  getNotifications,
  checkStudentEligibility,
  updateApplicationRequestStatus,
  getCourseGrades,
  getAllAnnouncements,
  getAllInstructors,
  getAllCourses,
  applyToPost,
  addAnnouncement,
  updateApplicationById,
  getAnnouncement,
  updateAnnouncement,
  getApplicationsByPost,
  getApplicationByUsername,
  validateLogin,
  getTranscript,
  getTerms,
  logout,
  getApplicationRequestsByStudentId,
  getAllAnnouncementsOfInstructor,
  postTranscript,
  getApplicationRequestsByApplicationId,
  getCurrentTranscript,
  deleteApplicationById,
  getStudentCourseGrades,
  getApplicationRequestById,
  updateApplicationRequest,
  finalizeStatus,
  getTranscriptInfo,
  addFollowerToApplication,
  removeFollowerFromApplication,
  getApplicationsByFollower,
  withdrawApplication,
  commitAppReq,
  forgivenAppReq,
  getStudentLaHistory,
  updateAppEmail,
  resetCommitmentofAppReq,
  updateWorkHour,
  redFlagAppReq,
  unFlagAppReq
};
