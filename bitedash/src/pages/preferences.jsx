import { useState, useEffect, React, useContext, Fragment } from "react";
import { collection, doc, updateDoc,  query, where, getDocs, setDoc } from "@firebase/firestore";
import { firestore, } from "../firebase";
import { useMsal } from '@azure/msal-react';
import 'firebase/firestore';
import { SnackbarContext } from '../SnackbarContext';
import { IconButton } from '@mui/material'
import Snackbar from '@mui/material/Snackbar';
import { IoIosClose } from 'react-icons/io'
import "./preferenceStyle.css"
import { Button, Card, Col, Container, Row } from "react-bootstrap";
import { FaFire, FaUserCircle } from "react-icons/fa";
import { IoSettingsOutline } from "react-icons/io5";
import "./flags.css"
// import PhoneInput, { formatPhoneNumber } from 'react-phone-number-input'
import {FormControl, FormControlLabel, Radio, RadioGroup} from '@mui/material'



export const Preferences = () => {

    const { accounts } = useMsal();

    const { open, message, closeSnackbar, openSnackbar } = useContext(SnackbarContext);

    const currentUser = accounts[0];

    const prefNotifRef = doc(firestore, "users", currentUser.homeAccountId)

    const handleSnack = () => (
        openSnackbar("Settings Saved Successfully")
    )

    const action = (
        <Fragment>
            <IconButton
                size="medium"
                aria-label="close"
                color="inherit"
                onClick={closeSnackbar}
            >
                <IoIosClose fontSize="xx-large" />
            </IconButton>
        </Fragment>
    )

    useEffect(() => {
        const fetchData = async () => {
            try {
                const currentUserQuery = query(
                    collection(firestore, 'users'), 
                    where('email', '==', currentUser.username)
                );
                const currentUserSnapshot = await getDocs(currentUserQuery);
                const phoneNumberStore = currentUserSnapshot.docs[0].data().phoneNumber;
                const prefStore = currentUserSnapshot.docs[0].data().prefNotification;
                const hallStore = currentUserSnapshot.docs[0].data().prefLocation;
                const lunchStore = currentUserSnapshot.docs[0].data().prefTimeLunch;
                const dinnerStore = currentUserSnapshot.docs[0].data().prefTimeDinner;
                const streakStore = currentUserSnapshot.docs[0].data().streak
                const nameStore = currentUserSnapshot.docs[0].data().name
                const emailStore = currentUserSnapshot.docs[0].data().email

                setState({
                    ...state,
                    changePhone: phoneNumberStore,
                    notPref: prefStore,
                    selectedHall: hallStore,
                    Lunch: lunchStore,
                    Dinner: dinnerStore,
                    Streak: streakStore,
                    Name: nameStore,
                    email: emailStore
                });

            } catch (err) {
                console.log(err);
            }
        };

        fetchData();

    }, []);

    const [state, setState] = useState({
        changePhone: "",
        displayPhone: "",
        notPref: "",
        selectedHall: "",
        email: "",
        Lunch: "",
        Dinner: "",
        Streak: 0,
        Name: ""
    });

    const [selectedOption, setSelectedOption] = useState(state.notPref);
    //maybe move...

    function handleChange(event) {
        const value = event.target.value;
        setState({
            ...state,
            [event.target.name]: value,
        });
    }

    const handleOptionChange = (changeEvent) => {
        setSelectedOption(changeEvent.target.value);
    };

    const handleFormSubmit = async (formSubmitEvent) => {
        console.log(state);
        formSubmitEvent.preventDefault();

        await setDoc(prefNotifRef, {
            prefNotification: selectedOption
        }, {merge:true});

        //Mike's Code for updating Firebase
        await updateDoc(prefNotifRef,
            {
                phoneNumber: state.changePhone,
                prefLocation: state.selectedHall,
                prefTimeLunch: state.Lunch,
                prefTimeDinner: state.Dinner
            }, { merge: true })
    };


    function handlePhoneChange(event) {
        const input = event.target.value.replace(/\D/g, ''); // Remove all non-digit characters
        if (input.length <= 10) { // Limit to 10 characters
          // Format the value for display
          const formattedValue = input.replace(/(\d{3})(\d{3})(\d{4})/, '($1)-$2-$3');
          setState({
            ...state,
            changePhone: input, // Store the plain format in state
            displayPhone: formattedValue, // Store the formatted value for display
          });
        }
    }


    return (
        <div style={{ paddingBottom: '10rem', overflow: "clip"}}>
            <div className="container gx-1" style={{
            }}>
                <Container fluid className='stayAtTop'>
                    <Row className="justify-content-md-center">
                        <Col></Col>
                        <Col className="d-flex align-items-center justify-content-center"><h1>Preferences</h1></Col>
                        <Col></Col>
                        <hr id="topLinePref" className="solid" />
                    </Row>
                </Container>
                <Row>
                    <Col></Col>
                    <Col xs={10}>
                        <Card style={{ width: "90% !important" }} text="dark">
                            <Card.Header>
                                <h1> <FaUserCircle /> User</h1>
                            </Card.Header>
                            <Card.Body>
                                <h3> {state.Name}</h3>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col></Col>
                </Row>
                <Row style={{ padding: "1rem 0" }}>
                    <Col></Col>
                    <Col xs={10} className="align-items-center justify-content-center">
                        <Card>
                            <Card.Header>
                                <h1><FaFire color="red" stroke="orange" strokeWidth={30} /> Streak </h1>
                            </Card.Header>
                            <Card.Body>
                                <h2>{state.Streak} days</h2>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col></Col>
                </Row>
            </div>

            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <Container className="gx-1">
                    <Row>
                        <Col></Col>
                        <Col xs={10}>
                            <Card>
                                <Card.Header><h1> <IoSettingsOutline/> Settings</h1></Card.Header>
                                <form onSubmit={handleFormSubmit}>
                                    <Container className="align-items-center justify-content-center">
                                        <Row>
                                            <Col></Col>
                                            <Col className="emailCont" xs={10} style={{height: "65px"}}>
                                                <h2 style={{ fontSize: "24px" }}>Current Email: </h2>
                                                <hr id="emailLinePref" className="solid" />
                                                <h2 style={{ fontSize: "18px" }}>{state.email}</h2>
                                            </Col>
                                            <Col></Col>
                                        </Row>
                                    </Container>
                                    <Container>
                                        <Row>
                                            <Col></Col>
                                            <Col className="emailCont" xs={10} style={{height: "70px"}}>
                                                <h3>Phone Number:</h3>
                                                <div>
                                                    <label id="phoneLabel">
                                                        {/* <PhoneInput defaultCountry="US" countries={["US", "CA"]} placeholder="Enter phone number" value={value} onChange={(e)=>{setValue(e); handlePhoneChange(e)}}/> */}
                                                        <input
                                                            type="tel"
                                                            value={state.displayPhone} // display the nicely formatted number to the user
                                                            onChange={handlePhoneChange}
                                                            placeholder="Enter phone number"
                                                        />
                                                    </label>
                                                </div>
                                            </Col>
                                            <Col></Col>
                                        </Row>
                                    </Container>
                                    <Container id="radios">
                                        <Row>
                                            <Col></Col>
                                            <Col className="emailCont" xs={10} style={{height: "250px"}}>
                                                <h3 style={{ fontSize: "24px" }}>Notification Options</h3>
                                                <div>
                                                    <h4 style={{ fontSize: "17px" }}>How'd you like to be notified?</h4>
                                                    <FormControl>
                                                        <RadioGroup
                                                        aria-labelledby="demo-radio-buttons-group-label"
                                                        name="radio-buttons-group"
                                                        value={state.notPref}>
                                                            <Row>
                                                                <Col className="d-flex align-items-center">
                                                                    <h5 style={{paddingLeft: "1rem"}}>SMS</h5>
                                                                </Col>
                                                                <Col className='d-flex justify-content-end'>
                                                                    <FormControlLabel
                                                                    id="notPref+phoneNotif"
                                                                    name="notPref"
                                                                    value="phoneNotif"
                                                                    control={<Radio onClick={(e)=>{handleOptionChange(e); handleChange(e);} } />}
                                                                    />
                                                                </Col>
                                                            </Row>
                                                            <Row>
                                                                <Col className="d-flex align-items-center">
                                                                    <h5 style={{paddingLeft: "1rem"}}>Email</h5>
                                                                </Col>
                                                                <Col className='d-flex justify-content-end'>
                                                                    <FormControlLabel
                                                                    id="notPref+phoneNotif"
                                                                    name="notPref"
                                                                    value="emailNotif"
                                                                    control={<Radio onClick={(e)=>{handleOptionChange(e); handleChange(e);} } />}
                                                                    />
                                                                </Col>
                                                            </Row>
                                                            <Row>
                                                                <Col className="d-flex align-items-center">
                                                                    <h5 style={{paddingLeft: "1rem"}}>Both</h5>
                                                                </Col>
                                                                <Col className='d-flex justify-content-end'>
                                                                    <FormControlLabel
                                                                    id="notPref+phoneNotif"
                                                                    name="notPref"
                                                                    value="bothNotif"
                                                                    control={<Radio onClick={(e)=>{handleOptionChange(e); handleChange(e);} } />}
                                                                    />
                                                                </Col>
                                                            </Row>
                                                            <Row>
                                                                <Col className="d-flex align-items-center">
                                                                    <h5 style={{paddingLeft: "1rem"}}>None</h5>
                                                                </Col>
                                                                <Col className='d-flex justify-content-end' >
                                                                    <FormControlLabel
                                                                    id="notPref+phoneNotif"
                                                                    name="notPref"
                                                                    value="noNotif"
                                                                    control={<Radio onClick={(e)=>{handleOptionChange(e); handleChange(e);} } />}
                                                                    />
                                                                </Col>
                                                            </Row>
                                                        </RadioGroup>
                                                    </FormControl>
                                                </div>
                                            </Col>
                                            <Col></Col>
                                        </Row>
                                    </Container>
                                    <Container>
                                        <Row>
                                            <Col></Col>
                                            <Col className="emailCont" xs={10} style={{height: "125px"}}>
                                            <h3 style={{ fontSize: "24px" }}>Set Favorite Dining Hall: </h3>
                                                <label className="d-flex align-items-center justify-content-center redOutline prefBoxStyle">
                                                    <select className="dropdownPref redOutline prefBoxStyle" name="selectedHall" value={state.selectedHall} onChange={handleChange}>
                                                        <option value="N/A">N/A</option>
                                                        <option value="Hicks">Hicks</option>
                                                        <option value="MAP">Map</option>
                                                        <option value="CFA">CFA</option>
                                                    </select>
                                                </label>
                                            </Col>
                                            <Col></Col>
                                        </Row>

                                    </Container>
                                    <Container>
                                        <Row>
                                            <Col></Col>
                                            <Col className="emailCont" xs={10} style={{height: "250px"}}>
                                                <h3 style={{ fontSize: "24px" }}>Preferred Meal Times</h3>
                                                <label className="d-flex align-items-center justify-content-center">
                                        <div style={{width: "100%"}}>
                                            <h5>Lunch:</h5>
                                            <select className="dropdownPref redOutline prefBoxStyle" name="Lunch" value={state.Lunch} onChange={handleChange}>
                                                <option value="Undef">None Selected</option>
                                                <option value="11:00">11:00</option>
                                                <option value="11:30">11:30</option>
                                                <option value="12:00">12:00</option>
                                                <option value="12:30">12:30</option>
                                                <option value="1:00">1:00</option>
                                                <option value="1:30">1:30</option>
                                                <option value="2:00">2:00</option>
                                                <option value="2:30">2:30</option>
                                                <option value="3:00">3:00</option>
                                                <option value="3:30">3:30</option>
                                                <option value="4:00">3:00</option>
                                                <option value="4:30">4:30</option>
                                            </select>

                                            <h5>Dinner: </h5>
                                            <select className="dropdownPref redOutline prefBoxStyle" name="Dinner" value={state.Dinner} onChange={handleChange}>
                                                <option value="Undef">None Selected</option>
                                                <option value="5:00">5:00</option>
                                                <option value="5:30">5:30</option>
                                                <option value="6:00">6:00</option>
                                                <option value="6:30">6:30</option>
                                                <option value="7:00">7:00</option>
                                                <option value="7:30">7:30</option>
                                                <option value="8:00">8:00</option>
                                                <option value="8:30">8:30</option>
                                            </select>
                                        </div>
                                    </label>
                                            </Col>
                                            <Col></Col>
                                        </Row>
                                    
                                    
                                    </Container>
                                    
                                    <div className="form-group d-flex align-items-center justify-content-center">
                                        <Container className="d-flex align-items-center justify-content-center">
                                        <Button onClick={(e) => {handleSnack(e); handleFormSubmit(e);}} className="btn-block btn-lg redOutline redFill" variant="dark"> Save Changes </Button>
                                        </Container>
                                        <Snackbar
                                            open={open}
                                            autoHideDuration={5000}
                                            onClose={closeSnackbar}
                                            message={message}
                                            action={action}
                                            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                                            style={{ bottom: "6rem !important" }}
                                        />
                                    </div>
                                </form>
                            </Card>
                        </Col>
                        <Col></Col>
                    </Row>
                </Container>
            </div>
        </div>
    );
};