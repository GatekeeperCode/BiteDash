import LeavePageButton from '../../components/friendsList/ExitButton';
import { useNavigate, useLocation} from 'react-router-dom';
import { Button, Col, Container, Row } from "react-bootstrap";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import './friendsPageStyling.css';
import { collection, query, where, getDocs, Timestamp, setDoc, doc } from "@firebase/firestore";
import { firestore } from "../../firebase";
import { useMsal } from '@azure/msal-react';
import { useState, useEffect } from "react";
import { FormControl, FormControlLabel, Radio, RadioGroup, TextField, Autocomplete, MenuItem, Select, } from "@mui/material";
import { FaCheck } from "react-icons/fa6";
import { useContext } from 'react';
import { SnackbarContext } from '../../SnackbarContext';

export const PlanABite = ({ setSnackbarOpen }) => {
    const { openSnackbar } = useContext(SnackbarContext);
    const [userData, setUserData] = useState([]);
    const [disableShare, setDisableShare] = useState(true);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);
    const { accounts } = useMsal();
    const currentUser = accounts[0];
    const [] = useState();
    let history = useNavigate();
    const location = useLocation();

    //form values
    const [formData, setFormData] = useState({
        accepted: [], // Initialize with an empty array
        end_time: null, // Initialize with null
        invited: [], // Initialize with an empty array
        location: '',
        owner: '',
        start_time: null, // Initialize with null
        title: '',
    });

    useEffect(() => {
        async function fetchData() {
            const data = await fetchFirestoreData(currentUser);
            setUserData(data);
        }
    
        
    
        fetchData();
    }, []);

    useEffect(() => {
        function setShare() {
            if (location.state.name !== "none") {
                handleShareOff();
                setSelectedItems([location.state.name]);
    
                setFormData((prevData) => ({
                    ...prevData,
                    invited: [location.state.name.name],
                }));
            } else {
                handleShareOn();
            }
        }

        if (userData) {
            setShare();
        }
    }, [userData]);

    const handleCreateBite = async () => {
        try {
            const combinedDateTime = new Date(
                selectedDate.$d.getFullYear(),
                selectedDate.$d.getMonth(),
                selectedDate.$d.getDate(),
                selectedTime.$d.getHours(),
                selectedTime.$d.getMinutes()
            );

            const firestoreTimestamp = Timestamp.fromDate(combinedDateTime);
            const endTimestamp = Timestamp.fromMillis(firestoreTimestamp.toMillis() + 2700000);

            const id = Timestamp.now();


            // Create a new document in the 'bite' collection
            await setDoc(doc(firestore, "bite", id.toMillis().toString()), {
                accepted: formData.accepted,
                end_time: endTimestamp,
                invited: formData.invited,
                location: formData.location,
                owner: currentUser.name,
                start_time: firestoreTimestamp,
                title: formData.title,
                timestamp: id.toMillis(),
            });
            handleSnack();
            history("/friends");
        } catch (error) {
            console.error('Error creating bite:', error);
        }
    };

    const handleSnack = () => {
        openSnackbar("Bite created successfully!");
    }

    const handleShareOn = () => {
        setDisableShare(true);
        const selectedUsers = userData.map(user => user.name);

        setSelectedItems([]);

        setFormData(prevData => ({
            ...prevData,
            invited: selectedUsers,
        }));
    };

    const handleShareOff = () => {
        setDisableShare(false);
        setSelectedItems([]);
        setFormData((prevData) => ({
            ...prevData,
            invited: [],
        }));
    }

    const handleSelectedUsers = (event, newValue) => {
        setSelectedItems(newValue); // Update selected items
        if (newValue != []) {
            const selectedUsers = newValue.map((user) => user.name);
            setFormData((prevData) => ({
                ...prevData,
                invited: selectedUsers,
            }));
        } else {
            setFormData((prevData) => ({
                ...prevData,
                invited: [],
            }));
        }
    };

    const handleSelectedHall = (event) => {
        const selectedLocation = event.target.value;
        setFormData((prevData) => ({
            ...prevData,
            location: selectedLocation,
        }));
    }

    const handleTimeChange = (time) => {
        setSelectedTime(time);
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };


    const handleBiteName = (event) => {
        const enteredTitle = event.target.value;
        setFormData((prevData) => ({
            ...prevData,
            title: enteredTitle,
        }));
    }

    const validateForm = () => {
        // Check if all fields are filled
        if (formData.title !== "" && (formData.location !== "" && formData.location !== "Select a Location") && selectedDate !== null && selectedTime !== null && formData.invited.length > 0) {
            return true;
        }
        return false;
    };


    return (
        <div style={{ overflow: "hidden !important" }}>
            <Container fluid className='stayAtTop'>
                <Row className="justify-content-md-center">
                    <Col className="btn-block">
                        <LeavePageButton onClick={() => history("/friends")} className="btn-block"></LeavePageButton>
                    </Col>
                    <Col xs={5} className="titleText">
                        <h1 className="titleText">Plan a Bite</h1>
                    </Col>
                    <Col >
                    </Col>
                </Row>
                <hr id="topLine" className="solid" />
            </Container>
            <div>
                <Container fluid>
                    <Col className="justify-content-md-center">
                        <Row className='dateTime' >
                            <Col>
                                <h2>Bite Name</h2>
                            </Col>
                            <Col>
                                <TextField onChange={(event) => handleBiteName(event)} placeholder="Bite name" inputProps={{ maxLength: 20 }} fullWidth></TextField>
                            </Col>
                        </Row>
                        <Row className='dateTime'>
                            <Col>
                                <h2>Dining Hall: </h2>
                            </Col>
                            <Col>
                                <FormControl className='formBoxes'>
                                    <Select
                                        displayEmpty
                                        defaultValue={""}
                                        fullWidth= {true}
                                        onChange={(event) => handleSelectedHall(event)}>
                                        <MenuItem value="">
                                            <em>Select a Location</em>
                                        </MenuItem>
                                        <MenuItem value="Hicks">Hicks Dining Hall</MenuItem>
                                        <MenuItem value="MAP">Map Dining Hall</MenuItem>
                                        <MenuItem value="CFA">Chick-fil-A</MenuItem>
                                    </Select>
                                </FormControl>
                            </Col>
                        </Row>
                        <hr id="hallLine" class="solid" />
                        <Row className="dateTime">
                            <Col>
                                <h2>Date: </h2>
                            </Col>
                            <Col>
                                <DatePicker defaultValue={null} className='formBoxes' id="time" onChange={handleDateChange} ></DatePicker>
                            </Col>
                        </Row>
                        <Row className="dateTime">
                            <Col>
                                <h2>Time: </h2>
                            </Col>
                            <Col>
                                <TimePicker defaultValue={null} className='formBoxes' onChange={handleTimeChange} />
                            </Col>
                        </Row>
                        <hr id="hallLine" class="solid" />
                        <Row>
                            <h2>Who do you want to invite?</h2>
                            <Col>
                                <FormControl>
                                    <RadioGroup
                                        aria-labelledby="demo-radio-buttons-group-label"
                                        value={(disableShare) ? "share" : "invite"}
                                        name="radio-buttons-group"
                                    >
                                        <Row>
                                            <Col className='d-flex align-items-center'>
                                                <h3>All friends</h3>
                                            </Col>
                                            <Col className='d-flex justify-content-end' style={{paddingRight: "3rem"}}>
                                                <FormControlLabel
                                                    className='redRadio'
                                                    value="share"
                                                    control={<Radio onClick={() => handleShareOn()} />}
                                                    labelPlacement="start"
                                                    sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                                                />
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col className='d-flex align-items-center'>
                                                <h3>Specific people</h3>
                                            </Col>
                                            <Col className='d-flex justify-content-end' style={{paddingRight: "3rem"}}>
                                                <FormControlLabel
                                                    className='redRadio'
                                                    value="invite"
                                                    control={<Radio onClick={() => handleShareOff()} />}
                                                    labelPlacement="start"
                                                    sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                                                />
                                            </Col>
                                        </Row>

                                    </RadioGroup>
                                </FormControl>
                            
                            {(disableShare) ? (<em></em>) : (
                                <Autocomplete
                                style={{paddingTop: "1rem", }}
                                sx={{ m: 1 }}
                                disabled={disableShare}
                                multiple
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                options={userData}
                                getOptionLabel={(option) => option.name}
                                disableCloseOnSelect
                                onChange={handleSelectedUsers}
                                value={selectedItems} // Pass the selected items
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        variant="outlined"
                                        placeholder="Select Friends"
                                    />
                                )}
                                renderOption={(props, option, { selected }) => (
                                    <MenuItem
                                        {...props}
                                        key={option.id}
                                        value={option.email}
                                        sx={{ justifyContent: 'space-between' }}
                                    >
                                        {option.name}
                                        {selected ? <FaCheck color="black" /> : null}
                                    </MenuItem>
                                )}
                            />) }
                            </Col>
                        </Row>
                        <Row className="create" >
                            <Button className='redFill redOutline' size="lg" onClick={handleCreateBite} disabled={!validateForm()}>Create</Button>
                        </Row>
                    </Col>
                </Container>
            </div>
        </div>
    );

    async function fetchFirestoreData(currentUser) {
        const currentUserQuery = query(
            collection(firestore, 'users'),
            where('email', '==', currentUser.username)
        );
        const currentUserSnapshot = await getDocs(currentUserQuery);
        const friendsEmails = currentUserSnapshot.docs[0].data().friends;

        const myFriends = [];
        for (let email of friendsEmails) {
            const myFriendsQuery = query(
                collection(firestore, 'users'),
                where('email', '==', email)
            );
            const myFriendsSnapshot = await getDocs(myFriendsQuery);
            myFriendsSnapshot.forEach((doc) => {
                myFriends.push({ id: doc.id, ...doc.data() });
            });
        };
        return myFriends;
    }

}