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
import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

import InputLabel from '@mui/material/InputLabel';

import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { getTerms, getAllInstructors, getAllCourses } from "../apiCalls";
import { makeStyles } from '@mui/styles';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import OutlinedInput from '@mui/material/OutlinedInput';
import { NewspaperTwoTone } from "@mui/icons-material";


const useStyles = makeStyles((theme) => ({
  activeItem: {
    backgroundColor: 'lightgreen',

    '&:hover': {
      color: 'black',
      fontWeight: 'normal'
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


  const userName = useSelector((state) => state.user.username);

  const term = useSelector((state) => state.user.term);

  const [authUsersList, setAuthUserList] = useState([]); //get instructors from database
  const [authPeople, setAuthPeople] = useState([]); //used for send request as selected from list
  const [authValue, setAuthValue] = useState(""); // for autocomplete
  const [inputAuthValue, setAuthInputValue] = useState(""); // for autocomplete

  const [courseCodeList, setCourseCodeList] = useState([]); //get course codes from database
  const [courseList, setcourseList] = useState([]); //get courses from database

  const [courseCode, setCourseCode] = useState(""); //used for send request as selected from list to course code
  const [courseCodeValue, setCourseCodeValue] = useState(""); // for autocomplete
  const [inputCourseCodeValue, setCourseCodeInputValue] = useState(""); // for autocomplete

  const [selectedCourses, setSelectedCourses] = useState([]); //used for send request as selected from list to desired courses
  const [courseValue, setCourseValue] = useState(""); // for autocomplete
  const [inputCourseValue, setCourseInputValue] = useState(""); // for autocomplete

  const [allTerms, setAllTerms] = useState([])


  const [open, setOpen] = React.useState(false);
  const [showAddButton, setShowAddButton] = useState(false);
  const classes = useStyles();

  //get all instructors
  useEffect(() => {
    getAllInstructors().then((results) => {
      const filteredResults = results.filter((instructor) => { //for removing current user from options
        return instructor.instructor_username !== userName;
      });

      const transformedResults = filteredResults.map((instructor) => {
        const lastName = instructor.user.surname
        const firstName = instructor.user.name
        const displayName = firstName.trim() + " " + lastName.trim();
        const OptionValue = displayName + " (" + instructor.user.email + ")";

        return {
          display_name: displayName,
          username: instructor.email,
          authOptionValue: OptionValue,
          id: instructor.user.id
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
            title: course.courseCode
          }
        })

        setCourseCodeList(courseCodes);
        setcourseList(courseCodes);
      } catch (error) {

      }
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

  console.log(authPeople) //for debugging authPeople

  //used in autocomplete for keeping value and input value
  function handleCourseCodeAdd(newValue) { //change here
    if (newValue !== null) {
      const selectedCourseCode = courseCodeList.find((course) => course === newValue);
      updateCourseCode(selectedCourseCode)
      setSelectedCourses([...selectedCourses, selectedCourseCode]);
    }
    // setCourseCodeValue("");
    // setCourseCodeInputValue("");
  }

  function updateCourseCode(courseCode) {
    setCourseCode(courseCode);
  }

  function handleCourseCodeDelete() { //change here
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

  function filterCourseCodes(optionCourseCodes, { inputValue }) {

    const filtered = optionCourseCodes.filter((option) => {
      if (courseCode === option.title) {
        return false; // filter out if already in selectedCourses
      }
      return option.title.toLowerCase().includes(inputValue.trim().toLowerCase());
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
    const isExisting = optionCourseCodes.some((option) => inputValue.trim() === option.title);
    if (inputValue && !isExisting) {
      filtered.push({
        inputValue,
        title: `Add "${inputValue.trim()}"`
      })
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
      (course) => course !== courseToDelete
    );
    // console.log(updatedSelectedCourses)
    setSelectedCourses(updatedSelectedCourses);
  }



  const [announcementDetails, setAnnouncementDetails] = useState({
    term: {},
    course_code: courseCode,
    lastApplicationDate: new Date().toLocaleDateString("en-CA"),
    lastApplicationTime: new Date()
      .toLocaleTimeString()
      .replace(/(.*)\D\d+/, "$1"),
    letterGrade: "A",
    workHours: "5 Hours",
    jobDetails: "",
    authInstructor: authPeople,
    desiredCourses: selectedCourses,
  });

  // set changes for autocomplete
  useEffect(() => {
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
    if (reason !== 'backdropClick') {
      setOpen(false);
    }
  };

  const handleChange = (event, newValue) => {
    if (newValue) {

      var trimmedValue;
      if (typeof newValue === 'string') {

        trimmedValue = newValue;
      }
      // Add "xxx" option created dynamically
      else if (newValue.inputValue) {

        trimmedValue = newValue.inputValue;
      }
      else {

        trimmedValue = newValue.title;
      }

      trimmedValue.trim()

      setCourseCodeValue(trimmedValue);
      setCourseCode(trimmedValue);

      if (!courseList.some(course => course.title === trimmedValue)) {
        setcourseList((prev) => [...prev, { title: trimmedValue }]);
      }
    }

  }



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
        <Grid container spacing={2}>
          <Grid item xs={6}>
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
              <Typography>Term <span style={{ color: 'red' }}>*</span>:</Typography>
              <Box sx={{ minWidth: 150, marginX: 2 }}>
                <FormControl fullWidth>

                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={announcementDetails.term}
                    name="term"
                    MenuProps={{
                      style: { maxHeight: '360px' },
                      autoFocus: false
                    }}
                    onChange={handleInput}

                  >
                    {
                      allTerms.map((eachTerm, index) => (
                        <MenuItem
                          key={eachTerm.term_desc}
                          value={eachTerm}
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
              {

              }
            </Grid>
            <Grid
              container
              direction="row"
              justifyContent="start"
              alignItems="center"
            >
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
                sx={{ width: 300 }}
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





            </Grid>
            <Grid
              container
              direction="row"
              justifyContent="start"
              alignItems="center"
            >
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
                sx={{ m: 2 }}
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
                sx={{ m: 2 }}
                onChange={handleInput}
              />
            </Grid>
            <Grid
              container
              direction="row"
              justifyContent="start"
              alignItems="center"
            >
              <Typography> Minimum Desired Letter Grade<span style={{ color: 'red' }}>*</span>:</Typography>
              <TextField
                id="outlined-select-currency"
                name="letterGrade"
                select
                value={announcementDetails.letterGrade}
                size="small"
                sx={{ m: 2, width: 225 }}
                onChange={handleInput}
              >
                {grades.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid
              container
              direction="row"
              justifyContent="start"
              alignItems="center"
            >
              <Typography>Weekly Work Hours<span style={{ color: 'red' }}>*</span>:</Typography>
              <TextField
                id="outlined-select-currency"
                name="workHours"
                select
                value={announcementDetails.workHours}
                size="small"
                sx={{ m: 2, width: 225 }}
                onChange={handleInput}
              >
                {WorkHour && WorkHour.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid
              container
              direction="row"
              justifyContent="start"
              alignItems="flex-start"
            >
              <Typography paddingTop={3}>Job Details<span style={{ color: 'red' }}>*</span>:</Typography>
              <TextField
                placeholder="Enter Job Details..."
                name="jobDetails"
                value={announcementDetails.jobDetails}
                multiline
                size="small"
                rows={5}
                maxRows={20}
                sx={{ m: 2, width: 400 }}
                onChange={handleInput}
                required
              />
            </Grid>
            <Grid
              container
              direction="row"
              justifyContent="start"
              alignItems="flex-start"
            >
              <Typography sx={{ my: 2 }}>Authorized Instructor(s):</Typography>
              <Grid
                item
                xs={6}
                direction="column"
                justifyContent="center"
                alignItems="flex-start"
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
                      sx={{ mx: 2, mt: 1, mb: 2, width: 300 }}
                    />
                  )}
                />
                {authPeople &&
                  authPeople.map((authPerson, index) => {
                    return (
                      <Chip
                        key={authPerson.username}
                        label={authPerson.display_name}
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
                        sx={{ m: 1 }}
                        onDelete={() => handleAuthDelete(authPerson)}
                      />
                    );
                  })}
              </Grid>
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
                alignItems="flex-start"
                sx={{ backgroundColor: (selectedCourses && selectedCourses.length === 0) ? "#FFF" : "#F5F5F5" }}
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
                <Button onClick={handleClickOpen}>Open select dialog</Button>
                <Dialog disableEscapeKeyDown open={open} onClose={handleClose}>
                  <DialogTitle>Fill the form</DialogTitle>
                  <DialogContent>
                    <Box component="form" sx={{ display: 'flex', flexWrap: 'wrap' }}>
                      <FormControl sx={{ m: 1, minWidth: 120 }}>
                        <InputLabel htmlFor="demo-dialog-native">Age</InputLabel>

                        <Autocomplete
                          id="controllable-states-demo"
                          options={courseList && courseList.map((course) => {
                            return course;
                          })}
                          filterOptions={filterCourseCodes}
                          value={courseCodeValue}
                          inputValue={inputCourseCodeValue}
                          onInputChange={(event, newInputCourseCodeValue) => {
                            if (newInputCourseCodeValue !== null) {
                              setCourseCodeInputValue(newInputCourseCodeValue);
                            }
                          }}
                          onChange={(event, newCourseCodeValue) => {
                            if (newCourseCodeValue !== null) {
                              setCourseCodeValue(newCourseCodeValue);
                              //handleCourseCodeAdd(newCourseCodeValue);
                              updateCourseCode(newCourseCodeValue)
                            }
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              multiline
                              size="small"
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
                        //getOptionDisabled={(option) => !!courseCode && option !== courseCode}
                        />
                      </FormControl>
                      <FormControl sx={{ m: 1, minWidth: 120 }}>
                        <InputLabel id="demo-dialog-select-label">Age</InputLabel>
                        <Select
                          labelId="demo-dialog-select-label"
                          id="demo-dialog-select"
                          value={null}
                          onChange={(event, newCourseValue) => {
                            if (newCourseValue !== null) handleCourseAdd(newCourseValue);
                          }}
                          input={<OutlinedInput label="Age" />}
                        >

                        </Select>
                      </FormControl>
                    </Box>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleClose}>Ok</Button>
                  </DialogActions>
                </Dialog>
                {selectedCourses &&
                  selectedCourses.map((courseSelected, i) => {
                    return (
                      <Chip
                        key={courseSelected}
                        label={courseSelected}
                        variant="outlined"
                        avatar={
                          <Avatar
                            sx={{
                              backgroundColor:
                                i % 2 === 0 ? "#5FB3F6" : "#2196F3",
                            }}
                          >
                            <Typography fontSize="small" sx={{ color: "white" }}>
                              {courseSelected.split(" ")[0][0]}
                            </Typography>
                          </Avatar>
                        }
                        color={courseSelected === courseCode ? "error" : "default"}
                        sx={{ m: 1 }}
                        onDelete={() => handleCourseDelete(courseSelected)}
                      />
                    );
                  })}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <AddQuestion AnnouncementDetails={announcementDetails} username={userName} />
      </Box>
    </Box>
  );
}


export default CreateAnnouncement;
