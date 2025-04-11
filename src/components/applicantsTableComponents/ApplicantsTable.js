import React, { useEffect } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Typography, IconButton, Collapse, Snackbar, Grid, Button, Divider, Tab, Container, Tooltip } from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import SearchIcon from '@mui/icons-material/Search';
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Box from "@mui/material/Box";
import { getApplicationRequestsByStudentId, updateApplicationRequestStatus, getCourseGrades, getCurrentTranscript, getApplicationsByPost, updateApplicationById, getAnnouncement, getTranscript, getApplicationByUsername, getAllAnnouncements, finalizeStatus, acceptAllRequestByAppId, rejectAllRequestByAppId, getStudentLaHistory, getApplicationRequestsByApplicationId, resetCommitmentofAppReq, updateWorkHour, redFlagAppReq, unFlagAppReq } from "../../apiCalls";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SaveIcon from '@mui/icons-material/Save';
import { useNavigate } from "react-router-dom";
import QuestionAnswer from "./QuestionsAndAnswers";
import LaHistoryTable from "./LaHistoryTable";
import ReqCourseGrades from "./ReqCourseGrades";
import TextField from '@mui/material/TextField';
import Popup from "../../components/popup/Popup";
import FlagPopup from "../../components/popup/FlagPopup";
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import { borders } from '@mui/system';
import { toast } from "react-toastify";
import { handleInfo } from "../../errors/GlobalErrorHandler";
import HelpCenterIcon from "@mui/icons-material/HelpCenter";
import Avatar from '@mui/material/Avatar';
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { WorkHour } from "../../pages/CreateAnnouncement";
import { useStyles } from '../../pages/EligibilityTable';
import { WrapText } from "@mui/icons-material";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const grades = [
  { value: "A", label: 12 },
  { value: "A-", label: 11 },
  { value: "B+", label: 10 },
  { value: "B", label: 9 },
  { value: "B-", label: 8 },
  { value: "C+", label: 7 },
  { value: "C", label: 6 },
  { value: "C-", label: 5 },
  { value: "D+", label: 4 },
  { value: "D", label: 3 },
  { value: "S", label: 2 },
  { value: "W", label: 1 },
];

function CustomRow(props) {
  const { row, index, questions, appId, courseCode, ann } = props;
  const [open, setOpen] = React.useState(false);
  const [snackOpen, setSnackOpen] = React.useState(false);
  const [status, setStatus] = React.useState("");
  const [LaHistory, setLaHistory] = React.useState([]);
  const [userID, setUserID] = React.useState("");
  const navigate = useNavigate();
  const [studentDetails, setStudentDetails] = React.useState({});
  const [laHistoryPage, setLaHistoryPage] = React.useState(0);
  const [requiredCourses, setRequiredCourses] = React.useState([]);
  const photoUrl = useSelector((state) => state.user.photoUrl);
  const classes = useStyles();
  const [resetOpened, setResetOpened] = React.useState(false);
  const [flagOpened, setFlagOpened] = React.useState(false);
  const [isInstructor, setIsInstructor] = React.useState(false);
  const [isStudent, setIsStudent] = React.useState(false);
  const [toStatusForFlag, setToStatusForFlag] = React.useState("");
  const [courseGradess, setCourseGradess] = React.useState(null);
  const [numOfHistory, setNumOfHistory] = React.useState(null);
  console.log(row);
  console.log(ann);


  const getCommitStatus = (status) => {
    switch (status) {
      case "Committed":
        return classes.committedBox;
      case "Declined":
        return classes.declinedBox;
      case "Not Committed":
        return classes.notCommittedBox;
      case "Error":
        return classes.errorBox;
      default:
        return;
    }
  };
  const determineCommitmentStatus = () => {
    if (row.committed && row.forgiven) {
      return 'Error';  // Both true
    } else if (row.committed && !row.forgiven) {
      return 'Committed';  // Committed true, forgiven false
    } else if (!row.committed && row.forgiven) {
      return 'Declined';  // Committed false, forgiven true
    } else {
      return 'Not Committed';  // Both false
    }
  };

  useEffect(() => {
    const prevCourseGrades = ann.previousCourseGrades;
    const transcript = row.transcript;

    console.log(prevCourseGrades);
    console.log(transcript);

    if (prevCourseGrades && transcript?.course) {
      try {
        const requiredCoursesData = prevCourseGrades.map((req) => {
          const course = transcript.course.find((course) => course.courseCode === req.course.courseCode);
          return {
            courseCode: req.course.courseCode,
            grade: course?.grade || 'N/A'
          };
        });
        setRequiredCourses(requiredCoursesData);
      } catch (error) {
        console.error("Error processing course grades:", error);
        setRequiredCourses([]);
      }
    }

  }, []);

  console.log(requiredCourses);



  useEffect(() => {
    setUserID(row.student.user.id);
  }, [row.student.user.id]);

  const handleSnackClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setSnackOpen(false);
  };


  const flagFlipFlop = () => {
    setFlagOpened((prev) => !prev);
  };

  const handleChange = (event) => {
    props.setIsThere(false);
    const toStatus = event.target.value
    if(row.status === "Accepted" && row.statusIns === "Accepted"){
      setToStatusForFlag(toStatus);
      flagFlipFlop();
    }
    else{
      updateApplicationRequestStatus(row.applicationRequestId, toStatus).then((res) => {

        props.setRows((prev)=>prev.map((each)=>{
          if (each.applicationRequestId === row.applicationRequestId){
            return ({
              ...each,
              statusIns: toStatus
            })
          }
          return ({...each})
        }));

        props.setFiltered((prev)=>prev.map((each)=>{
          if (each.applicationRequestId === row.applicationRequestId){
            return ({
              ...each,
              statusIns: toStatus
            })
          }
          return ({...each})
        } ));

        props.setSortedRows((prev)=>prev.map((each)=>{
          if (each.applicationRequestId === row.applicationRequestId){
            return (courseGradess &&{
              ...each,
              statusIns: toStatus,
              studentDetails: {
                ...prev.studentDetails,
                course: {
                  courseCode: props.courseCode,
                  grade: courseGradess??[0].grade,
                },
              },
            })
          }
          return ({...each})
        } ));
        setSnackOpen(true);
        console.log(res);
      });
    }
  };



  function changeName(student_name) {
    const [lastName, firstName] = student_name.split(",");
    const modifiedStudentName = firstName.trim() + " " + lastName.trim();
    return modifiedStudentName;
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentTranscript = await getCurrentTranscript(row.student.user.id);
        setStudentDetails(currentTranscript);

        const courseGrades = await getCourseGrades([props.courseCode], userID);
        setCourseGradess(courseGrades);
        if (courseGrades.length > 0) {
          setStudentDetails((prev) => ({
            ...prev,
            course: {
              courseCode: props.courseCode,
              grade: courseGrades[0].grade,
            },
          }));

          props.setRows((prev) => prev.map((each) => {
            if (each.applicationRequestId === row.applicationRequestId) {
              return ({
                ...each,
                studentDetails: {
                  ...prev.studentDetails,
                  course: {
                    courseCode: props.courseCode,
                    grade: courseGrades[0].grade,
                  },
                },
              });
            }

            return ({ ...each });
          }
          ));
        }
      } catch (error) {
        // Centralized error handling or log the error
        console.error("Error fetching data:", error);
        setStudentDetails(null);
      }
    };
    if (userID) {
      fetchData();
    }

  }, [row.student.user.id, props.courseCode, userID]);


  useEffect(() => {
    getStudentLaHistory(row.student.user.id, props.appId, laHistoryPage)
      .then((res) => {
        setLaHistory(res);
        setNumOfHistory(res.totalElements);
        props.setRows((prev) => prev.map((each) => {
          if (each.applicationRequestId === row.applicationRequestId) {
            return ({
              ...each,
              numOfLAHistory: res.totalElements
            })
          }
          return ({ ...each })
        }
        ));
      })
      .catch((_) => {
      });
  }, [row.student.user.id, props.appId, row.status, laHistoryPage]);


  const handlePageChange = (event, value) => {
    setLaHistoryPage(value - 1);
  };

  const resetCommitment = () => {
    resetCommitmentofAppReq(row.applicationRequestId).then(() => {
      row.committed = false;
      row.forgiven = false;
      setSnackOpen(true);
    }).catch((_) => {
    });
  }

  const handleWorkHourUpdate = (e) => {
    console.log('e.target.value :>> ', e.target.value);
    updateWorkHour(row.applicationRequestId, e.target.value)
      .then(() => {

        handleInfo("Successfully updated the work hour.")
        props.setRows((prev) => prev.map((each) => {
          if (each.applicationRequestId === row.applicationRequestId) {
            return ({
              ...each,
              weeklyWorkHours: e.target.value
            })
          }

          return ({ ...each })
        }))
      }).catch((_) => { })
  }

  const flipPopupReset = () => {
    setResetOpened((prev) => !prev);
  };

  useEffect(() => {
    if (row.statusIns !== row.status) {
      props.setIsThere(true);
    }
  }, [row.statusIns, row.status, row]);


  const redFlagAppReqq = () => {
    redFlagAppReq(row.applicationRequestId).then((res) => {
      props.setRows((prev)=>prev.map((each)=>{
        if (each.applicationRequestId === row.applicationRequestId){
          return ({
            ...each,
            statusIns: toStatusForFlag,
            redFlagged: true
          })
        }
        return ({...each})
      }))
      console.log(res);
      setSnackOpen(true);
    }).then(()=>{
      updateApplicationRequestStatus(row.applicationRequestId, toStatusForFlag).then((res) => {

        props.setRows((prev)=>prev.map((each)=>{
          if (each.applicationRequestId === row.applicationRequestId){
            return ({
              ...each,
              statusIns: toStatusForFlag
            })
          }
          return ({...each})
        }))
        setSnackOpen(true);
        console.log(res);
      });
    });
  }

  const noFlagChange = () => {
    updateApplicationRequestStatus(row.applicationRequestId, toStatusForFlag).then((res) => {

      props.setRows((prev)=>prev.map((each)=>{
        if (each.applicationRequestId === row.applicationRequestId){
          return ({
            ...each,
            statusIns: toStatusForFlag
          })
        }
        return ({...each})
      }))
      setSnackOpen(true);
      console.log(res);
    });
  }

  const handleFlagChange = () => {
    if(isInstructor){
      noFlagChange();
    }
    else{
      redFlagAppReqq();
    }
  }



 console.log("RENDERING CUSTOM ROW");

  console.log('row :>> ', row);
  return (
    row && numOfHistory &&<>
      <TableRow key={index + 1} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
        <TableCell sx={{ bgcolor: "#FAFAFA", borderBottom: "none" }} align="right">
          <Avatar
            src={row.student.user.photoUrl}
            alt="Student Photo"
            sx={{ width: 64, height: 64 }}
            slotProps={{
              img: {
                style: {
                  padding: "0px",
                  height: '100%',
                  width: '100%',
                  objectFit: 'fill',
                }
              }
            }}
          />
        </TableCell>
        <TableCell sx={{ borderBottom: "none" }} component="th" scope="row">
          {row.transcript.studentSuId}
        </TableCell>
        <TableCell sx={{ bgcolor: "#FAFAFA", borderBottom: "none" }} align="left">
          {row.student.user.name + " " + row.student.user.surname}
        </TableCell>
        <TableCell sx={{ borderBottom: "none" }} component="th" scope="row">
          {studentDetails?.program && studentDetails.program.majors.map((major, index) => (
            <div key={index}>{major}</div>
          ))}
        </TableCell>

        <TableCell sx={{ bgcolor: "#FAFAFA", borderBottom: "none" }} component="th" scope="row">
          {studentDetails?.program && studentDetails.program.minors.map((minor, index) => (
            <div key={index}>{minor}</div>
          ))}
        </TableCell>
        <TableCell sx={{ borderBottom: "none" }} component="th" scope="row">
          {studentDetails?.cumulativeGPA}
        </TableCell>
        <TableCell sx={{ bgcolor: "#FAFAFA", borderBottom: "none" }} align="left">
          {console.log('studentDetails :>> ', studentDetails)}
          {studentDetails?.course && studentDetails.course.grade}
        </TableCell>

        <TableCell sx={{ borderBottom: "none" }} align="left">
          <Snackbar
            open={snackOpen}
            autoHideDuration={3000}
            onClose={handleSnackClose}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
          >
            <Alert onClose={handleSnackClose} severity="success">
              Status is successfully changed
            </Alert>
          </Snackbar>
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", position: 'relative' }}>
            <FormControl fullWidth color={row.statusIns !== row.status ? "info" : ""} focused={row.statusIns !== row.status ? "True" : ""}>
              <InputLabel id="demo-simple-select-label">{row.statusIns !== row.status ? "Status (*)" : "Status"}</InputLabel>
              <Select labelId="demo-simple-select-label" id="demo-simple-select" value={row.statusIns} label={row.statusIns !== row.status ? "Status(*)" : "Status"} onChange={handleChange}>
                <MenuItem value={"Accepted"}>Accepted</MenuItem>
                <MenuItem value={"Rejected"}>Rejected</MenuItem>
                <MenuItem value={"In Progress"}>In Progress</MenuItem>
                <MenuItem value={"Waiting List"}>Waiting List</MenuItem>
              </Select>
            </FormControl>
            {row.statusIns !== row.status ? (
              <Tooltip
                title="(*) stands for the students who have different status than the final status. Student cannot see this status before finalization (e.g. Accepted but not finalized yet.)"
                placement="top-start"
                sx={{ fontSize: 'small' }}
                arrow
                componentsProps={{
                  tooltip: {
                    sx: {
                      backgroundColor: '#a4a2a2', // Change to your desired lighter color
                      color: 'rgba(255,255,255,0.87)', // Adjust text color if needed
                      boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
                      fontSize: '14px',
                    },
                  },
                }}
              >
                <HelpCenterIcon sx={{ position: 'relative', top: '-25px' }} /> {/* Adjust the top value to move the icon up or down */}
              </Tooltip>
            ) : null}
          </Box>
        </TableCell>

        <TableCell sx={{ bgcolor: "#FAFAFA", borderBottom: "none" }} component="th" scope="row">

          <TextField
            id="outlined-select-currency"
            name="workHours"
            select
            value={row.weeklyWorkHours}
            size="small"
            sx={{ width: 120 }}
            onChange={handleWorkHourUpdate}
          >
            {WorkHour && WorkHour.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </TableCell>
        <TableCell sx={{ borderBottom: "none" }} component="th" scope="row">
          <span className={getCommitStatus(determineCommitmentStatus())}>
            {determineCommitmentStatus()}
          </span>
        </TableCell>
        <TableCell sx={{ borderBottom: "none" }} align="right">
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => {
              setOpen(!open);
              console.log(row);
            }}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow style={{ alignItems: "start", verticalAlign: "top" }}>
        {open && <TableCell style={{ paddingBottom: 0, paddingTop: "1rem", }} colSpan={3}>
          <td>
            <Collapse in={open} align="top" component="tr" style={{ padding: 0, display: "block", }}>
              <Grid container direction="column" alignItems="flex-start" justifyContent="flex-start" style={{ width: "20rem" }}>
                {/* Q&A Section */}
                {row.qandA.length > 0 && row.qandA.map((element, index) => (
                  <QuestionAnswer
                    key={index}
                    qNo={index + 1}
                    question={element.question}
                    answer={element.answer}
                  />
                ))}
              </Grid>
            </Collapse>
          </td>
        </TableCell>}

        {requiredCourses.length > 0 &&
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={2}>
            <Collapse in={open} component="tr" style={{ display: "block" }}>
              <td style={{ width: "100%" }}>
                <ReqCourseGrades
                  requiredCourses={requiredCourses}
                />
              </td>
            </Collapse>
          </TableCell>}




        <TableCell style={{ paddingBottom: 0, paddingTop: 0, allign: "right" }} colSpan={8}>
          <Collapse in={open} component="tr" style={{ display: "block" }}>
            <td style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              paddingRight: "20px"
            }}>
              <Stack spacing={0} justifyContent="flex-end">
                <LaHistoryTable
                  LaHistory={LaHistory}
                  courseCode={courseCode}
                  
                />
                <Pagination count={LaHistory.totalPages} page={laHistoryPage + 1} onChange={handlePageChange} />

              </Stack>

            </td>


            <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "flex-end" }}>

              <Button
                variant="outlined"
                endIcon={<AccountCircleIcon />}
                sx={{ m: "10px" }}
                onClick={() => navigate("/profile/" + userID, { replace: false })}
              >
                Student Profile
              </Button>

              <Button
                variant="outlined"
                endIcon={<RestartAltIcon />}
                sx={{ m: "10px" }}
                onClick={() => flipPopupReset()}
                disabled={determineCommitmentStatus() === "Not Committed"}
              >
                Reset Commitment
              </Button>
            </Box>

            <Popup
            opened={resetOpened}
            flipPopup={flipPopupReset}
            title={"Confirm Resetting the Commitment?"}
            text={"Resetting the commitment will make the student's commitment status as 'Not Committed'. Are you sure you want to reset the commitment?"}
            posAction={() => { resetCommitment(); flipPopupReset(); }}
            negAction={flipPopupReset}
            posActionText={"Reset Commitment"}
          />

          <FlagPopup 
            opened={flagOpened}
            flipPopup={flagFlipFlop}
            title={"Cannot Change the Status"}
            text={"You cannot change the status of the student who is already accepted. If you want to change the status, you need to finalize the status of the students first."}
            posAction={() => { handleFlagChange(); flagFlipFlop(); }}
            negAction={flagFlipFlop}
            posActionText={"OK"}
            isInstructor={isInstructor}
            isStudent={isStudent}
            setIsInstructor={setIsInstructor}
            setIsStudent={setIsStudent}

          />


          </Collapse>
        </TableCell>

      </TableRow>
    </>
  );
}

function ApplicantsTable(props) {
  const [sortOrder, setSortOrder] = React.useState(null);
  const [histOrder, setHistOrder] = React.useState(null);
  const [finalizeee, setFinalizeee] = React.useState(false);
  const [sortedRows, setSortedRows] = React.useState([]);
  const [gradeSortOrder, setGradeSortOrder] = React.useState(null);
  const [searchText, setSearchText] = React.useState('');
  const [isFilterVisible, setIsFilterVisible] = React.useState(false);
  const [questions, setQuestions] = React.useState([]);
  const isApplicantsListEmpty = props.rows.length === 0;
  const dispatch = useDispatch();
  const [finalizePopoUpOpened, setFinalizePopoUpOpened] = React.useState(false);
  const [finalizePopupOrdinaryOpened, setFinalizePopupOrdinaryOpened] = React.useState(false);
  const ann = props.announcement;
  const navigate = useNavigate();
  const [isThere, setIsThere] = React.useState(false);
  const [filtered, setFiltered] = React.useState(null);

  console.log("RENDERING APPLICANTS TABLE");

  

  const getHashedValue = (value) => {
    return grades.find((grade) => grade.value === value)?.label;
  };

  const handleSearchChange = (event) => {
    setSearchText(event.target.value.toLowerCase());
  };

  const flipPopup = () => {
    setFinalizePopoUpOpened((prev) => !prev);
  };

  const flipPopupOrdinary = () => {
    setFinalizePopupOrdinaryOpened((prev) => !prev);
  };

const handleCallBack = () => {
  console.log("CALLBACK");
  console.log(props.rows);
  console.log("SORTED ROWS",sortedRows);
  console.log("FILTERED",filtered);
  setIsThere(false);
  setFiltered(null);
  props.setRows(sortedRows.map((row) => {
    console.log("SEE THE ROW",row);
    return ({
      ...row,
      status: row.statusIns,
      studentDetails: {
        ...row.studentDetails,
        course: {
          courseCode: props.courseCode,
          grade: row.studentDetails?.course?.grade,
        },
      },
    });
  }));

}

useEffect(() => {
  const filteredRows = sortedRows?.filter((row) => {
    const fullName = row.student.user.name.toLowerCase() + " " + row.student.user.surname.toLowerCase();
    return fullName.includes(searchText);
  });
  setFiltered(filteredRows);
}, [props.rows,searchText, sortedRows, finalizeee ]);

  const sortRows = (rows) => {
    return rows.sort((a, b) => {
      let nameComparison = 0;
      let gradeComparison = 0;
      let histComparison = 0;

      if (sortOrder === "asc" || sortOrder === "desc") {
        const nameA = a.student.user.name.toLowerCase();
        const nameB = b.student.user.name.toLowerCase();
        nameComparison = nameA.localeCompare(nameB);
        if (sortOrder === "desc") nameComparison *= -1;
      }

      if (gradeSortOrder === "asc" || gradeSortOrder === "desc") {
        const gradeA = a.studentDetails?.course?.grade || 0;
        const gradeB = b.studentDetails?.course?.grade || 0;
        gradeComparison = getHashedValue(gradeA) - getHashedValue(gradeB);
        if (gradeSortOrder === "desc") gradeComparison *= -1;
      }

      if (histOrder === "asc" || histOrder === "desc") {
        const histA = a.numOfLAHistory || 0;
        const histB = b.numOfLAHistory || 0;
        console.log(histA);
        console.log(histB);
        histComparison = histA - histB;
        if (histOrder === "desc") histComparison *= -1;
      }

      return gradeSortOrder ? gradeComparison : histOrder ? histComparison : nameComparison;
    });
  };

  useEffect(() => {
    setSortedRows(sortRows([...props.rows]));
  }, [sortOrder, gradeSortOrder, histOrder , finalizeee]);

  console.log(props.rows)

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : sortOrder === "desc" ? null : "asc");
  };

  const toggleGradeSortOrder = () => {
    setGradeSortOrder(gradeSortOrder === "asc" ? "desc" : gradeSortOrder === "desc" ? null : "asc");
  };

  const gradeSortOrderDesc = () => {
    setGradeSortOrder("desc");
    setSortOrder(null);
    setHistOrder(null);
  };

  const gradeSortOrderAsc = () => {
    setGradeSortOrder("asc");
    setSortOrder(null);
    setHistOrder(null);
  };

  const sortOrderDesc = () => {
    setSortOrder("desc");
    setGradeSortOrder(null);
    setHistOrder(null);
  };

  const sortOrderAsc = () => {
    setSortOrder("asc");
    setGradeSortOrder(null);
    setHistOrder(null);
  };

  const histOrderDesc = () => {
    setHistOrder("desc");
    setSortOrder(null);
    setGradeSortOrder(null);
  };

  const histOrderAsc = () => {
    setHistOrder("asc");
    setSortOrder(null);
    setGradeSortOrder(null);
  };

  const toggleFilterVisibility = () => {
    setIsFilterVisible(!isFilterVisible);
  };

  const handleAcceptAll = () => {
    acceptAllRequestByAppId(props.appId).then(() => {

      setSortedRows((prev) => prev.map(
        (row) => ({ ...row, statusIns: "Accepted" })
      ))
    }).catch(_ => {
      console.error("Error");
    })
  }
  const handleRejectAll = () => {
    rejectAllRequestByAppId(props.appId).then(() => {
      setSortedRows((prev) => prev.map(
        (row) => ({ ...row, statusIns: "Rejected" })
      ))
    }).catch(_ => {
      console.error("Error");
    })
  }

  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      //backgroundColor: theme.palette.common.black,
      //color: theme.palette.common.white,
      backgroundColor: '#FAFAFA',
      color: theme.palette.common.black,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
    },
  }));

  const isThereAnyAcceptedOrRejected = () => {
    try {
      getApplicationRequestsByApplicationId(ann.applicationId).then((results) => {
        console.log(results.applicationRequests);
        const res = results.applicationRequests.some((row) => (row.statusIns === "Accepted" && row.status !== "Accepted") || (row.statusIns === "Rejected" && row.status !== "Rejected"));

        if (res) {
          flipPopup();

        }
        else {
          flipPopupOrdinary();
        }
      });


    }
    catch (error) {
      handleInfo("Error while checking the status of the students");
    }
  }

  const finalizeStatuss = (appId) => {
    try {
      finalizeStatus(appId).then((res) => {
        setIsThere(false);
        handleCallBack();
        props.setFinalize((prev) => !prev);
        // refresh the page
        props.refresh();
        setFinalizeee((prev) => !prev);
        //setSortedRows(null);
        flipPopupOrdinary();
        handleInfo("Changes are successfully finalized.");
        //window.location.reload();
        
        

      });
    }
    catch (error) {
      console.log(error);
    }
  }


  return (
    sortedRows && filtered && <Box>
      {isApplicantsListEmpty ? (
        <Typography variant="h6" align="center" style={{ padding: 20 }}>
          <Alert severity="info">
            No student has applied yet.
          </Alert>
        </Typography>
      ) : (
        <>


          <TableContainer component={Paper} sx={{
            overflow: "auto",
            scrollbarWidth: "none", '&::-webkit-scrollbar': { display: 'none' }, '&-ms-overflow-style:': { display: 'none' }
          }}>
            <Table sx={{ minWidth: 600 }} stickyHeader aria-label="simple table" >
              <TableHead>
                <TableRow sx={{ bgcolor: "#eeeeee" }}>
                  <StyledTableCell align="center" width={10}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      Experience
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <IconButton onClick={histOrderAsc} style={{ marginBottom: '-10px' }}>
                          <ArrowDropUpIcon />
                        </IconButton>
                        <IconButton onClick={histOrderDesc} style={{ marginTop: '-8px' }}>
                          <ArrowDropDownIcon />
                        </IconButton>
                      </Box>
                  </Box>
                  </StyledTableCell>
                  <StyledTableCell align="left">ID</StyledTableCell>
                  <StyledTableCell align="left">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      Student Name
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <IconButton onClick={sortOrderAsc} style={{ marginBottom: '-10px' }}>
                          <ArrowDropUpIcon />
                        </IconButton>
                        <IconButton onClick={sortOrderDesc} style={{ marginTop: '-8px' }}>
                          <ArrowDropDownIcon />
                        </IconButton>
                      </Box>
                      <IconButton onClick={toggleFilterVisibility} style={{ color: isFilterVisible ? 'blue' : undefined, marginLeft: '-10px' }}>
                        <SearchIcon />
                      </IconButton>
                    </Box>
                    {isFilterVisible && (
                      <TextField
                        fullWidth
                        size="small"
                        value={searchText}
                        onChange={handleSearchChange}
                        placeholder="Search by name..."
                        autoFocus = {true}
                      />
                    )}
                  </StyledTableCell>
                  <StyledTableCell align="left">Majors</StyledTableCell>
                  <StyledTableCell align="left">Minors</StyledTableCell>
                  <StyledTableCell align="left">GPA</StyledTableCell>
                  <StyledTableCell align="left">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      Grade
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <IconButton onClick={gradeSortOrderAsc} style={{ marginBottom: '-10px' }}>  {/* Decrease marginBottom here */}
                          <ArrowDropUpIcon />
                        </IconButton>
                        <IconButton onClick={gradeSortOrderDesc} style={{ marginTop: '-8px' }}>
                          <ArrowDropDownIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </StyledTableCell>
                  <StyledTableCell align="left" sx={{ width: "10rem" }}>Status</StyledTableCell>
                  <StyledTableCell align="left" sx={{ width: "8rem" }}>Work Hours</StyledTableCell>
                  <StyledTableCell align="left" sx={{ width: "10rem" }}>Commitment Status</StyledTableCell>
                  <StyledTableCell align="left">Details</StyledTableCell>

                </TableRow>
              </TableHead>
              <TableBody>
                {filtered && filtered.map((row, index) => (
                  <CustomRow
                    appId={props.appId}
                    row={row}
                    setRows={props.setRows}
                    setSortedRows={setSortedRows}
                    courseCode={props.courseCode}
                    index={index}
                    questions={props.questions}
                    key={index}
                    ann={ann}
                    setIsThere={setIsThere}
                    setFiltered={setFiltered}
                  />
                ))}
              </TableBody>



            </Table>
          </TableContainer>
          <div
            style={{
              display: "flex",
              justifyContent: "right",
              alignItems: "center",
            }}>
            <Button variant="outlined" color="success" sx={{ marginRight: "1rem", marginTop: "0.5rem" }}
              onClick={handleAcceptAll}
            >
              Accept all
            </Button>
            <Button variant="outlined" color="error"
              onClick={handleRejectAll}
              sx={{ marginTop: "0.5rem", marginRight: "1rem" }}
            >
              Reject all
            </Button>

            <div container style={{
              display: "flex",
              alignItems: "start",
              marginTop: "0.5rem",
              direction: "columns",

            }}>

              <Button
                color='success'
                variant="contained"
                disableElevation
                endIcon={<SaveIcon />}
                onClick={isThereAnyAcceptedOrRejected}
                sx={{
                  ml: 2,
                  fontSize: "small"
                }}
              >
                Announce Final Results
              </Button>
            </div>

          </div>
          {isThere&&<div
          style={{
            display: "flex",
            justifyContent: "left",
            alignItems: "center",
          }}>
          <Alert variant="outlined" severity="info" style={{ marginTop:-35, width: "30rem" }}>
                    <Typography variant="body2" style={{ fontStyle: 'italic', fontSize:'small' }}>
                      There are applications that have different status than the final status. You can finalize the status to make the final status visible to the students.
                    </Typography>
                  </Alert>
          </div>}

          <Popup
            opened={finalizePopupOrdinaryOpened}
            flipPopup={flipPopupOrdinary}
            title={"Confirm Announcing Final Status?"}
            text={"If there would be a final status announcement, all the students will be notified about their final status. Are you sure you want to announce the final status?\n Final status can be done again after this action."}
            posAction={() => { finalizeStatuss(props.appId); }}
            negAction={flipPopupOrdinary}
            posActionText={"Finalize"}
          />


          <Popup
            opened={finalizePopoUpOpened}
            flipPopup={flipPopup}
            title={"Confirm Announcing Final Status?"}
            text={"You will be directed to the Finalization page "}
            posAction={() => { flipPopup(); navigate("/mails/" + ann.applicationId) }}
            negAction={flipPopup}
            posActionText={"Go to Page"}
          />

        </>

      )}
    </Box>

  );
}

export default ApplicantsTable;
