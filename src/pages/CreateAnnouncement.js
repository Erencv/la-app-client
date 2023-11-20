import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import AppBarHeader from "../components/AppBarHeader";
import Sidebar from "../components/Sidebar";
import AddQuestion from "../components/AddQuestion";
import { Typography, Box, Grid } from "@mui/material";
import TextField from "@mui/material/TextField";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";
import MenuItem from "@mui/material/MenuItem";
import Avatar from "@mui/material/Avatar";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import IconButton from "@mui/material/IconButton";
import ClearIcon from "@mui/icons-material/Clear";

import Alert from '@mui/material/Alert';
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

import InputLabel from "@mui/material/InputLabel";

import { Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { getTerms, getAllInstructors, getAllCourses } from "../apiCalls";
import { makeStyles } from "@mui/styles";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import OutlinedInput from "@mui/material/OutlinedInput";
import { NewspaperTwoTone } from "@mui/icons-material";
import HelpCenterIcon from "@mui/icons-material/HelpCenter";
import Tooltip from "@mui/material/Tooltip";
import TextareaAutosize from "@mui/material/TextareaAutosize";
import dayjs from "dayjs";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";

import AddIcon from "@mui/icons-material/Add";
import Checkbox from "@mui/material/Checkbox";

import CheckIcon from '@mui/icons-material/Check';
import FormControlLabel from '@mui/material/FormControlLabel';
import UseNumberInputCompact from '../components/IncDec'

const label = { inputProps: { 'aria-label': 'Checkbox demo' } };
const useStyles = makeStyles((theme) => ({
  activeItem: {
    backgroundColor: "lightgreen",

    "&:hover": {
      color: "black",
      fontWeight: "normal",
    },
  },
}));
const filter = createFilterOptions();
function CreateAnnouncement() {
  const grades = [
    { value: "A", label: "A" },
    { value: "A-", label: "A-" },
    { value: "B+", label: "B+" },
    { value: "B", label: "B" },
    { value: "B-", label: "B-" },
    { value: "C+", label: "C+" },
    { value: "C", label: "C" },
    { value: "C-", label: "C-" },
    { value: "D", label: "D" },
    { value: "S", label: "S" },
  ];
  const WorkHour = [
    { value: "PT1H", label: "1 Hour" },
    { value: "PT2H", label: "2 Hours" },
    { value: "PT3H", label: "3 Hours" },
    { value: "PT4H", label: "4 Hours" },
    { value: "PT5H", label: "5 Hours" },
    { value: "PT6H", label: "6 Hours" },
    { value: "PT7H", label: "7 Hours" },
    { value: "PT8H", label: "8 Hours" },
    { value: "PT9H", label: "9 Hours" },
    { value: "PT10H", label: "10 Hours" },
  ];

  const getColorForGrade = (grade) => {
    switch (grade) {
      case "A":
      case "A-":
        return "success";
      case "B+":
      case "B":
      case "B-":
        return "info";
      case "C+":
      case "C":
      case "C-":
        return "primary";
      case "D":
        return "warning";
      case "S":
        return "default";
      default:
        return "default";
    }
  };

  const userName = useSelector((state) => state.user.username);
  const name = useSelector((state) => state.user.name);
  const surname = useSelector((state) => state.user.surname);

  const term = useSelector((state) => state.user.term);

  const userId = useSelector((state) => state.user.id);

  const [authUsersList, setAuthUserList] = useState([]); //get instructors from database
  const [authPeople, setAuthPeople] = useState([
    {
      display_name: name + " " + surname,
      username: userName,
      authOptionValue: name + " " + surname + " (" + userName + ")",
      id: userId,
    },
  ]); //used for send request as selected from list
  const [authValue, setAuthValue] = useState(""); // for autocomplete
  const [inputAuthValue, setAuthInputValue] = useState(""); // for autocomplete

  const [courseCodeList, setCourseCodeList] = useState([]); //get course codes from database

  const [desiredCourseCode, setDesiredCourseCode] = useState("");
  const [desiredCourseList, setDesiredCourseList] = useState([]); //get courses from database
  const [desiredCourseCodeValue, setDesiredCourseCodeValue] = useState(""); // for autocomplete
  const [desiredCourseCodeInputValue, setDesiredCourseCodeInputValue] =
    useState(""); // for autocomplete
  const [isInprogressAllowed, setIsInprogressAllowed] = useState(false);

  const [courseList, setcourseList] = useState([]); //get courses from database
  const [courseCode, setCourseCode] = useState(""); //used for send request as selected from list to course code
  const [courseCodeValue, setCourseCodeValue] = useState(""); // for autocomplete
  const [inputCourseCodeValue, setCourseCodeInputValue] = useState(""); // for autocomplete

  const [selectedCourses, setSelectedCourses] = useState([]); //used for send request as selected from list to desired courses
  const [courseValue, setCourseValue] = useState(""); // for autocomplete
  const [inputCourseValue, setCourseInputValue] = useState(""); // for autocomplete

  const [allTerms, setAllTerms] = useState([]);

  const [open, setOpen] = React.useState(false);
  const [showAddButton, setShowAddButton] = useState(false);

  const [desiredLetterGrade, setDesiredLetterGrade] = useState({});

  const [error, setError] = React.useState(false);
  const classes = useStyles();
  

  function updateGrade(courseCode, index) {
    setSelectedCourses((prev) => {
      return prev.map((course) => {

        if (course.courseCode === courseCode) {

          return {
            ...course,
            grade: grades[index].label,
          };
        }
        return course;
      });
    });
  }
  //get all instructors
  useEffect(() => {
    getAllInstructors().then((results) => {
      const filteredResults = results.filter((instructor) => {
        //for removing current user from options
        return instructor.instructor_username !== userName;
      });

      const transformedResults = filteredResults.map((instructor) => {
        const lastName = instructor.user.surname;
        const firstName = instructor.user.name;
        const displayName = firstName.trim() + " " + lastName.trim();
        const OptionValue = displayName + " (" + instructor.user.email + ")";

        return {
          display_name: displayName,
          username: instructor.user.email,
          authOptionValue: OptionValue,
          id: instructor.user.id,
        };
      });
      setAuthUserList(transformedResults);
    });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getTerms();
        setAllTerms(res);
      } catch (error) {
        // Handle any errors if needed
      }
    };

    fetchData();
  }, []);

  // get all courses
  useEffect(() => {
    const fetchData = async () => {
      try {
        const results = await getAllCourses();

        const courseCodes = results.map((course) => {
          return {
            title: course.courseCode,
          };
        });

        setCourseCodeList(courseCodes);
        setcourseList(courseCodes);
        setDesiredCourseList(courseCodes);
      } catch (error) {}
    };

    fetchData();
  }, []);

  //used in autocomplete for keeping value and input value
  function handleAuthAdd(newValue) {
    if (newValue !== null) {
      const selectedUser = authUsersList.find(
        (user) => user.authOptionValue === newValue
      );
      setAuthPeople([...authPeople, selectedUser]);
    }
    setAuthValue("");
    setAuthInputValue("");
  }

  function handleAuthDelete(userToDelete) {
    const updatedAuthPeople = authPeople.filter(
      (user) => user.username !== userToDelete.username
    );
    // console.log(updatedAuthPeople)
    setAuthPeople(updatedAuthPeople);
  }

  //for auth filter options
  function filterOptions(options, { inputValue }) {
    const filtered = options.filter((option) => {
      if (authPeople.some((person) => person.authOptionValue === option)) {
        return false; // filter out if already in authPeople
      }
      return option.toLowerCase().includes(inputValue.toLowerCase());
    });

    // sort the filtered options based on their match with the input value
    const inputValueLowerCase = inputValue.toLowerCase();
    filtered.sort((a, b) => {
      const aIndex = a.toLowerCase().indexOf(inputValueLowerCase);
      const bIndex = b.toLowerCase().indexOf(inputValueLowerCase);
      if (aIndex !== bIndex) {
        return aIndex - bIndex;
      }
      return a.localeCompare(b);
    });

    return filtered;
  }

  console.log(authPeople); //for debugging authPeople

  //used in autocomplete for keeping value and input value
  function handleCourseCodeAdd(newValue) {
    //change here
    if (newValue !== null) {
      const selectedCourseCode = courseCodeList.find(
        (course) => course === newValue
      );
      updateCourseCode(selectedCourseCode);
      setSelectedCourses([...selectedCourses, selectedCourseCode]);
    }
    // setCourseCodeValue("");
    // setCourseCodeInputValue("");
  }

  function updateCourseCode(courseCode) {
    setCourseCode(courseCode);
  }

  function handleCourseCodeDelete() {
    //change here
    //console.log("Deleting course code");
    // const updatedSelectedCourses = selectedCourses.filter(
    //   (course) => course !== courseCode
    // );
    // setSelectedCourses(updatedSelectedCourses); //this leads some bug issues
    setSelectedCourses([]);
    setCourseCodeValue("");
    setCourseCodeInputValue("");
    setCourseCode("");
  }
  function handleDesiredCourseCodeDelete() {
    //change here
    //console.log("Deleting course code");
    // const updatedSelectedCourses = selectedCourses.filter(
    //   (course) => course !== courseCode
    // );
    // setSelectedCourses(updatedSelectedCourses); //this leads some bug issues
    //setSelectedCourses([]);
    setDesiredCourseCodeValue("");
    setDesiredCourseCodeInputValue("");
    setDesiredCourseCode("");
  }
  function filterCourseCodes(optionCourseCodes, { inputValue }) {
    const filtered = optionCourseCodes.filter((option) => {
      if (courseCode === option.title) {
        return false; // filter out if already in selectedCourses
      }
      return option.title
        .toLowerCase()
        .includes(inputValue.trim().toLowerCase());
    });

    // sort the filtered options based on their match with the input value
    const inputValueLowerCase = inputValue.toLowerCase();
    filtered.sort((a, b) => {
      const aIndex = a.title.toLowerCase().indexOf(inputValueLowerCase);
      const bIndex = b.title.toLowerCase().indexOf(inputValueLowerCase);
      if (aIndex !== bIndex) {
        return aIndex - bIndex;
      }
      return a.title.localeCompare(b.title);
    });
    const isExisting = optionCourseCodes.some(
      (option) => inputValue.trim() === option.title
    );
    if (inputValue && !isExisting) {
      filtered.push({
        inputValue,
        title: `Add "${inputValue.trim()}"`,
      });
    }

    return filtered;
  }

  //used in autocomplete for keeping value and input value
  function handleCourseAdd(newValue) {
    if (newValue !== null) {
      const selectedCourse = courseList.find((course) => course === newValue);
      setSelectedCourses([...selectedCourses, selectedCourse]);
    }
    setCourseValue("");
    setCourseInputValue("");
  }

  function handleCourseDelete(courseToDelete) {
    const updatedSelectedCourses = selectedCourses.filter(
      (course) => course.courseCode !== courseToDelete
    );
    // console.log(updatedSelectedCourses)
    setSelectedCourses(updatedSelectedCourses);
  }

  const istanbulTime = new Date().toLocaleTimeString("en-GB", {
    timeZone: "Europe/Istanbul",
    hour12: false,
  });

  const istanbulDate = new Date().toLocaleDateString("en-GB", {
    timeZone: "Europe/Istanbul",
  });

  const [announcementDetails, setAnnouncementDetails] = useState({
    term: {},
    course_code: courseCode,
    lastApplicationDate: istanbulDate,
    lastApplicationTime: istanbulTime.replace(/(.*)\D\d+/, "$1"),
    letterGrade: "A",
    workHours: "5 Hours",
    jobDetails: "",
    authInstructor: authPeople,
    desiredCourses: selectedCourses,
    isInprogressAllowed: false,
  });

  // set changes for autocomplete
  useEffect(() => {
    console.log(selectedCourses);
    setAnnouncementDetails((prevDetails) => ({
      ...prevDetails,
      course_code: courseCode,
      authInstructor: authPeople,
      desiredCourses: selectedCourses,
    }));
  }, [courseCode, authPeople, selectedCourses]);

  function handleInput(event) {
    const { name, value } = event.target;
    setAnnouncementDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  }

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    handleDesiredCourseCodeDelete();
    setDesiredLetterGrade(null);
    if (reason !== 'backdropClick') {
      setOpen(false);
    }
    setIsInprogressAllowed(false);
  };

  const handleChange = (event, newValue) => {
    if (newValue) {
      var trimmedValue;
      if (typeof newValue === "string") {
        trimmedValue = newValue;
      }
      // Add "xxx" option created dynamically
      else if (newValue.inputValue) {
        trimmedValue = newValue.inputValue;
      } else {
        trimmedValue = newValue.title;
      }

      trimmedValue.trim();

      setCourseCodeValue(trimmedValue);
      setCourseCode(trimmedValue);

      if (!courseList.some((course) => course.title === trimmedValue)) {
        setcourseList((prev) => [...prev, { title: trimmedValue }]);
      }
    }
  };
  const handleChangeDesired = (event, newValue) => {
    if (newValue) {
      var trimmedValue;
      if (typeof newValue === "string") {
        trimmedValue = newValue;
      }
      // Add "xxx" option created dynamically
      else if (newValue.inputValue) {
        trimmedValue = newValue.inputValue;
      } else {
        trimmedValue = newValue.title;
      }

      trimmedValue.trim();

      setDesiredCourseCodeValue(trimmedValue);
      setDesiredCourseCode(trimmedValue);

      if (!desiredCourseList.some((course) => course.title === trimmedValue)) {
        setDesiredCourseList((prev) => [...prev, { title: trimmedValue }]);
      }
    }
  };

  function extractSubstring(inputString) {
    const result = inputString.match(/^[^\s\d]+/);
    return result ? result[0].length : 2;
  }
  
 

  function extractSubstring(inputString) {
    const result = inputString.match(/^[^\s\d]+/);
    return result ? result[0].length : 2;
  }
  const handleAdd = () => {


    if (!desiredCourseCode || !desiredLetterGrade) {
      setError("Fill out the form.")
    }
    else if (selectedCourses.some((course) => course.courseCode === desiredCourseCode)) {
      setError("There is already requirement for this course.");
    }

    else {

      setSelectedCourses((prev) => ([
        ...prev,
        {
          courseCode: desiredCourseCode,
          grade: desiredLetterGrade,
          isInprogressAllowed: isInprogressAllowed
        }
      ]))
      handleClose();
    }

  }

  // useEffect(() => {
  //   console.log(announcementDetails)
  // }
  //   , [announcementDetails])

  useEffect(() => { setError(null) }, [desiredCourseCode, desiredCourseList])


  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar></Sidebar>
      <Box component="main" sx={{ flexGrow: 1, p: 5 }}>
        <AppBarHeader />
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="center"
          sx={{ mb: 4, mt: 2 }}
        >
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            Create Announcement
          </Typography>
        </Grid>
        <Grid container spacing={4}>
          <Grid item xs={8}>
            <Typography
              variant="h5"
              sx={{
                textDecoration: "underline",
                marginY: 2,
                fontWeight: "bold",
              }}
            >
              Announcement Details:
            </Typography>
            <Grid
              container
              direction="row"
              justifyContent="start"
              alignItems="center"
              marginY={2}
            >
              <Box sx={{ minWidth: 150 }}>
                <Typography>
                  Term <span style={{ color: "red" }}>*</span>:
                </Typography>
                <FormControl fullWidth>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={announcementDetails.term}
                    name="term"
                    sx={{ minWidth: 150, mt: 2 }}
                    MenuProps={{
                      style: { maxHeight: "360px" },
                      autoFocus: false,
                    }}
                    onChange={handleInput}
                  >
                    {
                      allTerms.map((eachTerm, index) => (
                        <MenuItem
                          key={eachTerm.term_desc}
                          value={eachTerm}
                          sx={{ maxHeight: '360px' }}
                          className={
                            eachTerm.is_active === '1'
                              ? classes.activeItem
                              : ''
                          }
                        >
                          {eachTerm.term_desc}
                        </MenuItem>
                      ))
                    }

                  </Select>
                </FormControl>
              </Box>
              {}
            </Grid>
            <Grid
              container
              direction="row"
              justifyContent="start"
              alignItems="center"
            >
              <Box sx={{ minWidth: 150 }}>
              <Typography>Course Code<span style={{ color: 'red' }}>*</span>:</Typography>

              <Autocomplete
                value={courseCodeValue}
                onChange={handleChange}
                filterOptions={filterCourseCodes}
                
                selectOnFocus
                clearOnBlur
                handleHomeEndKeys
                id="free-solo-with-text-demo"
                options={courseList}
                getOptionLabel={(option) => {
                  // Value selected with enter, right from the input
                  if (typeof option === 'string') {
                    return option;
                  }
                  // Add "xxx" option created dynamically
                  if (option.inputValue) {
                    return option.inputValue;
                  }
                  // Regular option
                  return option.title;
                }}
                renderOption={(props, option) => <li {...props}>{option.title}</li>}
                sx={{ width: 300, ml: -2 }}
                freeSolo
                renderInput={(params) => (
                  <TextField
                    {...params}

                    multiline
                    size="small"
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                      }
                    }}
                    onKeyPress={(event) => {
                      const key = event.key;
                      const regex = /^[A-Za-z0-9]+$/;

                      if (!regex.test(key) && key !== 'Enter') {
                        event.preventDefault();
                      }

                    }}
                    sx={{
                      mx: 2, mt: 1, mb: 2, width: 300,
                      ...(params.disabled && {
                        backgroundColor: 'transparent',
                        color: 'inherit',
                        pointerEvents: 'none',
                      }),
                    }}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {params.InputProps.endAdornment}
                          {courseCode && (
                            <IconButton
                              onClick={handleCourseCodeDelete}
                              aria-label="Clear"
                              size="small"
                            >
                              <ClearIcon />
                            </IconButton>
                          )}
                        </>
                      ),
                    }}
                  />
                )}
                disableClearable
              />

              </Box>



            </Grid>
            <Grid
              container
              direction="row"
              justifyContent="start"
              alignItems="center"
            >
              <Box sx={{ minWidth: 150 }}>
              <Typography>Last Application Date<span style={{ color: 'red' }}>*</span>:</Typography>
              <TextField
                id="outlined-required"
                name="lastApplicationDate"
                label="Enter last date"
                variant="outlined"
                type="date"
                value={announcementDetails.lastApplicationDate}
                InputLabelProps={{ shrink: true }}
                size="small"
                sx={{ mt:2 }}
                onChange={handleInput}
              />
              <TextField
                id="outlined-required"
                name="lastApplicationTime"
                label="Enter deadline"
                variant="outlined"
                type="time"
                value={announcementDetails.lastApplicationTime}
                InputLabelProps={{ shrink: true }}
                size="small"
                sx={{ mt:2, ml: 2 }}
                onChange={handleInput}
              />
              </Box>
            </Grid>
            <Grid
              container
              direction="row"
              justifyContent="start"
              alignItems="center"
            >

              <Box sx={{ minWidth: 150, mt:2 }}>
              <Typography> Minimum Desired Letter Grade<span style={{ color: 'red' }}>*</span>:</Typography>
              <TextField
                id="outlined-select-currency"
                name="letterGrade"
                select
                value={announcementDetails.letterGrade}
                size="small"
                sx={{ mt:2, width: 225 }}
                onChange={handleInput}
              >
                {grades.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              <FormControlLabel
                value={announcementDetails.isInprogressAllowed}
                onChange={(event) => {
                  setAnnouncementDetails((prevDetails) => ({
                    ...prevDetails,
                    isInprogressAllowed: event.target.checked, // Use event.target.checked for checkbox
                  }));
                }}
                control={<Checkbox />}
                label="Allow In Progress Applicants"
                sx={{ mt: 2, ml: 2 }}
              />

              </Box>

            </Grid>
            <Grid
              container
              direction="row"
              justifyContent="start"
              alignItems="center"
            >
              <Box sx={{ minWidth: 150, mt:2 }}>
              <Typography>Weekly Work Hours<span style={{ color: 'red' }}>*</span>:</Typography>
              <TextField
                id="outlined-select-currency"
                name="workHours"
                select
                value={announcementDetails.workHours}
                size="small"
                sx={{ mt: 2, width: 225 }}
                onChange={handleInput}
              >
                {WorkHour && WorkHour.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              </Box>
            </Grid>

            <Grid
              container
              direction="row"
              justifyContent="start"
              alignItems="flex-start"
            >
              <Box sx={{ minWidth: 150, mt:2 }}>
              <Typography paddingTop={3}>Job Details:</Typography>
              <TextField
                placeholder="Enter Job Details..."
                name="jobDetails"
                value={announcementDetails.jobDetails}
                multiline
                size="small"
                rows={5}
                maxRows={20}
                sx={{ mt: 2, width: 400 }}
                onChange={handleInput}
                required
              />
              </Box>
            </Grid>
            <Grid
              container
              direction="row"
              justifyContent="start"
              alignItems="flex-start"
            >
              <Box sx={{ minWidth: 150, mt:2 }}>
              <Typography sx={{ my: 2 }}>Authorized Instructor(s):</Typography>
              <Grid
                item
                xs={6}
                direction="column"
                justifyContent="center"
                alignItems="flex-center"
              >
                <Autocomplete
                  id="controllable-states-demo"
                  options={authUsersList && authUsersList.map((authUser) => {
                    return authUser.authOptionValue;
                  })}
                  filterOptions={filterOptions}
                  value={authValue}
                  inputValue={inputAuthValue}
                  onInputChange={(event, newInputValue) => {
                    if (newInputValue !== null) {
                      setAuthInputValue(newInputValue);
                    }
                  }}
                  onChange={(event, newValue) => {
                    if (newValue !== null) handleAuthAdd(newValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      multiline
                      size="small"
                      sx={{mb:1, mt: 1, width: 300 }}
                    />
                  )}
                />

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DemoContainer components={["TimePicker", "TimePicker"]}>
                    <div style={{ overflow: "hidden", marginLeft: "1rem" }}>
                      <TimePicker
                        id="outlined-required"
                        name="lastApplicationTime"
                        label="Enter deadline"
                        variant="outlined"
                        value={announcementDetails.lastApplicationTime}
                        InputLabelProps={{ shrink: true }}
                        onChange={(newValue) => {
                          setAnnouncementDetails((prevDetails) => ({
                            ...prevDetails,
                            lastApplicationTime: newValue,
                          }));
                        }}
                        ampm={false}
                        sx={{
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "lightgray !important", // Set the border color to gray
                            borderWidth: "1px ",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "black!important",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "black !important",
                          },
                          "& .MuiInputBase-input": {
                            color: "black", // Set the text color to black
                          },
                          "& .MuiInputLabel-root": {
                            color: "gray !important",
                          },

                          "& .MuiOutlinedInput-root": {
                            width: "105px !important",
                            height: "40px !important",
                          },
                          "& .MuiInputBase-root": {
                            height: "100%", // Ensure the input base takes the full height
                          },
                          "& .MuiPickersClock-pin": {
                            backgroundColor: "black", // Set the clock pin color
                          },
                          "& .MuiPickersClockPointer-pointer": {
                            backgroundColor: "black", // Set the clock pointer color
                          },
                          "& .MuiIconButton-root": {
                            padding: "8px", // Adjust the padding to make the clock icon smaller
                            "& .MuiSvgIcon-root": {
                              fill: "black", // Set the fill color of the clock icon to black
                              fontSize: "1rem",
                            },
                          },
                          "& .MuiTypography-body2": {
                            fontSize: "0.8rem", // Adjust the font size as needed
                          },
                          "& .MuiPaper-root": {
                            overflowY: "hidden ", // Hide the vertical scrollbar
                          },
                          marginTop: "9px",
                        }}
                      />
                    </div>
                  </DemoContainer>
                </LocalizationProvider>
                <Tooltip
                  title="The time you select is adjusted to Istanbul local time."
                  placement="right"
                >
                  <IconButton>
                    <HelpCenterIcon />
                  </IconButton>
                </Tooltip>
               
              </Box>
            </Grid>
            <Grid
              container
              direction="row"
              justifyContent="start"
              alignItems="center"
            >
              <Box sx={{ minWidth: 150, mt: 2 }}>
                <Typography>
                  {" "}
                  Minimum Desired Letter Grade
                  <span style={{ color: "red" }}>*</span>:
                </Typography>
                <TextField
                  id="outlined-select-currency"
                  name="letterGrade"
                  select
                  value={announcementDetails.letterGrade}
                  size="small"
                  sx={{ mt: 2, width: 225 }}
                  onChange={handleInput}
                >
                  {grades.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>

                <FormControlLabel
                  value={announcementDetails.isInprogressAllowed}
                  onChange={(event) => {
                    setAnnouncementDetails((prevDetails) => ({
                      ...prevDetails,
                      isInprogressAllowed: event.target.checked, // Use event.target.checked for checkbox
                    }));
                  }}
                  control={<Checkbox />}
                  label="Allow In Progress Applicants"
                  sx={{ mt: 2, ml: 2 }}
                />
              </Box>
            </Grid>
            <Grid
              container
              direction="row"
              justifyContent="start"
              alignItems="center"
            >
              <Box sx={{ minWidth: 150, mt: 2 }}>
                <Typography>
                  Weekly Work Hours<span style={{ color: "red" }}>*</span>:
                </Typography>
                <TextField
                  id="outlined-select-currency"
                  name="workHours"
                  select
                  value={announcementDetails.workHours}
                  size="small"
                  sx={{ mt: 2, width: 225 }}
                  onChange={handleInput}
                >
                  {WorkHour &&
                    WorkHour.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                </TextField>
              </Box>
            </Grid>

            <Grid
              container
              direction="column"
              justifyContent="start"
              alignItems="flex-start"
            >
              <div style={{display: "block"}}>
                <Typography paddingTop={3}>Job Details:</Typography>
              </div>
              <div style={{ margin: "15px 0", display: "block" }}>
                <TextareaAutosize
                  minRows={1} // Minimum number of rows
                  maxRows={20} // Maximum number of rows
                  rows={1}
                  size="small"
                  name="jobDetails"
                  multiline
                  sx={{ m: 2, width: 400 }}
                  value={announcementDetails.jobDetails}
                  onChange={handleInput}
                  placeholder="Enter the job details..."
                  style={{
                    width: "150%", // Adjusting width to account for padding and border
                    border: "1px solid #c1c4bc",
                    minWidth: '200px',
                    minHeight: "30px",
                    borderRadius: "5px",
                    padding: "8px", // Adjusted padding to give space between text and border
                    outline: "none",
                    fontFamily: "Arial, sans-serif", // Change the font family
                    fontSize: "15px", // Change the font size
                  }}
                />
              </div>
              
            </Grid>
            <Grid
              container
              direction="row"
              justifyContent="start"
              alignItems="flex-start"
            >
              <Box sx={{ minWidth: 150, mt: 2 }}>
                <Typography sx={{ my: 2 }}>
                  Authorized Instructor(s):
                </Typography>
                <Grid
                  item
                  xs={6}
                  direction="column"
                  justifyContent="center"
                  alignItems="flex-center"
                >
                  <Autocomplete
                    id="controllable-states-demo"
                    options={
                      authUsersList &&
                      authUsersList.map((authUser) => {
                        return authUser.authOptionValue;
                      })
                    }
                    filterOptions={filterOptions}
                    value={authValue}
                    inputValue={inputAuthValue}
                    onInputChange={(event, newInputValue) => {
                      if (newInputValue !== null) {
                        setAuthInputValue(newInputValue);
                      }
                    }}
                    onChange={(event, newValue) => {
                      if (newValue !== null) handleAuthAdd(newValue);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        multiline
                        size="small"
                        sx={{ mb: 1, mt: 1, width: 300 }}
                      />
                    )}
                  />
                  {authPeople &&
                    authPeople.map((authPerson, index) => {
                      return (
                        <Chip
                          key={authPerson.username}
                          label={
                            authPerson.display_name +
                            (authPerson.username === userName ? " (You)" : "")
                          }
                          variant="outlined"
                          avatar={
                            <Avatar
                              sx={{
                                backgroundColor:
                                  index % 2 === 0 ? "#6A759C" : "#4D5571",
                              }}
                            >
                              <Typography
                                fontSize="small"
                                sx={{ color: "white" }}
                              >
                                {authPerson.display_name.split(" ")[0][0]}
                              </Typography>
                            </Avatar>
                          }
                          sx={{ mt: 1 }}
                          onDelete={() => handleAuthDelete(authPerson)}
                          disabled={authPerson.username === userName}
                        />
                      );
                    })}
                </Grid>
              </Box>
            </Grid>
            <Grid
              container
              direction="row"
              justifyContent="start"
              alignItems="flex-start"
              sx={{ my: 2 }}
            >
              <Typography sx={{ my: 2 }}>Desired Course Grade(s):</Typography>
              <Grid
                item
                xs={6}
                direction="column"
                justifyContent="center"
                alignItems="center"
                sx={{
                  backgroundColor: (selectedCourses && selectedCourses.length === 0) ? "#FFF" : "#F5F5F5",
                  borderRadius: "5%",
                  marginTop: "0.5rem",
                  marginLeft: "1rem",
                  minWidth: "fit-content"
                }}
              >
                {/*<Autocomplete
                  id="controllable-states-demo"
                  options={courseList && courseList.map((course) => {
                    return course;
                  })}
                  filterOptions={filterCourses}
                  value={courseValue}
                  inputValue={inputCourseValue}
                  onInputChange={(event, newInputCourseValue) => {
                    if (newInputCourseValue !== null) {
                      setCourseInputValue(newInputCourseValue);
                    }
                  }}
                  onChange={(event, newCourseValue) => {
                    if (newCourseValue !== null) handleCourseAdd(newCourseValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      multiline
                      size="small"
                      sx={{ mx: 2, mt: 1, mb: 2, width: 300 }}
                    />
                  )}
                  disabled={courseCode && courseCode.length === 0} //if it creates some problems, delete it.
                />*/}






                <Grid container justifyContent={selectedCourses.length > 0 ? "center" : "flex-start"}>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={handleClickOpen}
                    sx={{
                      backgroundColor: "#9ADE7B",
                      padding: '4px',
                      width: "0.5rem",
                      '& .MuiButton-startIcon': {
                        marginLeft: 0,
                        fontSize: '1rem',
                      },
                    }}
                  >
                    <AddIcon />
                  </Button>
                </Grid>



                <Dialog disableEscapeKeyDown open={open} onClose={handleClose}>
                  <DialogTitle>New Requirement</DialogTitle>
                  <DialogContent>
                    <Box
                      component="form"
                      sx={{ display: "flex", flexWrap: "wrap" }}
                    >
                      <FormControl sx={{ m: 1, minWidth: 120 }}>
                        <Grid
                          container
                          direction="row"
                          justifyContent="start"
                          alignItems="center"
                        >
                          <Typography>
                            Course Code<span style={{ color: "red" }}>*</span>:
                          </Typography>

                          <Autocomplete
                            value={desiredCourseCodeValue}
                            onChange={handleChangeDesired}
                            filterOptions={filterCourseCodes}
                            label="course"
                            selectOnFocus
                            clearOnBlur
                            handleHomeEndKeys
                            id="free-solo-with-text-demo"
                            options={desiredCourseList}
                            getOptionLabel={(option) => {
                              // Value selected with enter, right from the input
                              if (typeof option === 'string') {
                                return option;
                              }
                              // Add "xxx" option created dynamically
                              if (option.inputValue) {
                                return option.inputValue;
                              }
                              // Regular option
                              return option.title;
                            }}
                            renderOption={(props, option) => <li {...props}>{option.title}</li>}
                            sx={{ width: 'fit-content', marginRight: "1rem" }}
                            freeSolo
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                multiline
                                size="small"
                                onKeyDown={(event) => {
                                  if (event.key === "Enter") {
                                    event.preventDefault();
                                  }
                                }}
                                onKeyPress={(event) => {
                                  const key = event.key;
                                  const regex = /^[A-Za-z0-9]+$/;

                                  if (!regex.test(key) && key !== "Enter") {
                                    event.preventDefault();
                                  }
                                }}
                                sx={{
                                  mx: 2,
                                  mt: 1,
                                  mb: 2,
                                  width: 150,
                                  ...(params.disabled && {
                                    backgroundColor: "transparent",
                                    color: "inherit",
                                    pointerEvents: "none",
                                  }),
                                }}
                                InputProps={{
                                  ...params.InputProps,
                                  endAdornment: (
                                    <>
                                      {params.InputProps.endAdornment}
                                      {desiredCourseCode && (
                                        <IconButton
                                          onClick={
                                            handleDesiredCourseCodeDelete
                                          }
                                          aria-label="Clear"
                                          size="small"
                                        >
                                          <ClearIcon />
                                        </IconButton>
                                      )}
                                    </>
                                  ),
                                }}
                              />
                            )}
                            disableClearable
                          />
                        </Grid>
                      </FormControl>
                      <FormControl sx={{ m: 1, minWidth: 120 }}>
                        <Grid
                          container
                          direction="row"
                          justifyContent="start"
                          alignItems="center"
                        >
                          <Typography>
                            {" "}
                            Minimum Desired Letter Grade
                            <span style={{ color: "red" }}>*</span>:
                          </Typography>
                          <TextField
                            id="outlined-select-currency"
                            name="letterGrade"
                            select
                            value={desiredLetterGrade}
                            size="small"
                            sx={{ m: 2, width: 225 }}
                            onChange={(event) => {
                              setDesiredLetterGrade(event.target.value);
                            }}
                          >
                            {grades.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </TextField>

                        </Grid>
                      </FormControl>
                      <FormControl sx={{ m: 1, minWidth: 120 }}>
                        <Grid
                          container
                          direction="row"
                          justifyContent="start"
                          alignItems="center"
                        >
                          <FormControlLabel
                            value={isInprogressAllowed}
                            onChange={(_) => {
                              setIsInprogressAllowed((prev) => !prev);
                            }}
                            control={<Checkbox />}
                            label="Allow In Progress Applicants"
                          />
                        </Grid>
                        {error && <Alert severity="error">{error}</Alert>}
                      </FormControl>
                    </Box>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button
                      onClick={() => {
                        handleAdd();
                      }}
                    >
                      Add
                    </Button>
                  </DialogActions>
                </Dialog>
                {selectedCourses.length > 0 && <Table>

                  <TableBody>

                    {selectedCourses.map((courseSelected, i) => (
                      <TableRow key={courseSelected.courseCode}>
                        <TableCell>
                          <Chip
                            label={courseSelected.courseCode}
                            variant="outlined"
                            avatar={
                              <Avatar
                                sx={{
                                  backgroundColor: i % 2 === 0 ? "#5FB3F6" : "#2196F3",
                                }}
                              >
                                <Typography fontSize="small" sx={{ color: "white" }}>
                                  {
                                    courseSelected.courseCode.slice(0, extractSubstring(courseSelected.courseCode))}
                                </Typography>
                              </Avatar>
                            }
                          />
                        </TableCell>
                        <TableCell>

                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Chip
                              label={courseSelected.grade}
                              color={getColorForGrade(courseSelected.grade)}
                              sx={{
                                backgroundColor: 'white',
                                fontWeight: 'bold',
                                marginRight: '8px',
                              }}
                              variant="outlined"
                            />
                           { <UseNumberInputCompact index={grades.findIndex((grade) => grade.label === courseSelected.grade)} grade={courseSelected.grade} courseCode={courseSelected.courseCode} callback={updateGrade}/>
                           }
                          </div>


                        </TableCell>
                        <TableCell>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <FiberManualRecordIcon
                              onClick={() => {


                                setSelectedCourses((prev) => {
                                  return prev.map((course) => {

                                    if (course.courseCode === courseSelected.courseCode) {

                                      return {
                                        ...course,
                                        isInprogressAllowed: !courseSelected.isInprogressAllowed,
                                      };
                                    }
                                    return course;
                                  });
                                });

                              }}
                              sx={{
                                cursor: "pointer",
                                color: courseSelected.isInprogressAllowed ? 'green' : 'red',
                                marginRight: 1,
                              }}
                            />
                            <Typography variant="body2" color={courseSelected.isInprogressAllowed ? 'textPrimary' : 'error'}>
                              {"IP " + (courseSelected.isInprogressAllowed ? 'Allowed' : 'Not Allowed')}
                            </Typography>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label="Delete"
                            color="error"
                            sx={{ cursor: 'pointer' }}
                            onClick={() => handleCourseDelete(courseSelected.courseCode)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <AddQuestion
          AnnouncementDetails={announcementDetails}
          username={userName}
        />
      </Box>
    </Box>
  );
}

export default CreateAnnouncement;
