import { Button, Row, Col, Container } from "react-bootstrap";
import { useState, useEffect, React} from 'react';
import BusynessRatingPopup from "../components/diningHalls/busynessRating";
import CheckInAlertPopup from "../components/diningHalls/checkInAlertPopup";
import { useNavigate, useLocation } from "react-router-dom";
import Meter from "../components/diningHalls/MunchMeter";
import "../components/diningHalls/Hall.css"
import MenuItem from "../components/menu/card";
import CFAMenu from "../components/menu/CFAMenu";
import { MdOutlineArrowBackIos } from "react-icons/md";
import { collection, where, getDocs, query, getDoc, limit, updateDoc, doc, increment} from '@firebase/firestore';
import { firestore } from "../firebase";
import { useMsal } from '@azure/msal-react';

function isLunchTime() {
    const now = new Date();
    return now.getHours() < 16 || (now.getHours() === 16 && now.getMinutes() < 30);
}

async function getMenuData(isLunchTime, diningHall) {
    const time = isLunchTime ? 'Lunch' : 'Dinner';

    const menuQuery = query(
        collection(firestore, 'menus'),
        where('diningHallName', '==', diningHall.toUpperCase()),
        where('mealTime', '==', time),
        limit(1)
    );

    const querySnapshot = await getDocs(menuQuery);
    return querySnapshot.docs[0].data();
}

async function getMealData(id) {
    id = id.toString()
    const mealRef = doc(firestore, 'meals', id);
    const mealSnapshot = await getDoc(mealRef);
    return mealSnapshot.data();
}

function DisplayMenuData({ diningHall, alert, isCheckedIn }) {
    const [menuData, setMenuData] = useState(null);
    const [mealData, setMealData] = useState({});
    // current user info
    const { accounts } = useMsal();
    const currentUser = accounts[0].name;

    useEffect(() => {
        async function fetchMenuData() {
            const data = await getMenuData(isLunchTime(), diningHall);
            setMenuData(data);
        }
        if (diningHall === 'CFA') return;
        fetchMenuData();
    }, []);

    useEffect(() => {
        async function fetchMealData() {
            if (!menuData) return;
            
            const mealPromises = Object.values(menuData.stations).flat().map(itemID => getMealData(itemID));
            const mealDataArray = await Promise.all(mealPromises);
    
            const mealData = mealDataArray.reduce((acc, meal, index) => {
                const itemID = Object.values(menuData.stations).flat()[index];
                acc[itemID] = meal;
                return acc;
            }, {});
    
            setMealData(mealData);
        }
        fetchMealData();
    }, [menuData]);

    function Menu() {
        const hallLocation = useLocation();

        return (
            <div style={{paddingBottom: "10rem"}}>
                {menuData && (
                    <div >
                        {Object.entries(menuData.stations).map(([stationName, stationItems], index) => (
                            <Container key={index} className="menuSection redOutline">
                                <h2 className="menuSectionTitle">{stationName}</h2>
                                {stationItems.map((itemId, itemIndex) => (
                                    <MenuItem
                                        key={itemIndex}
                                        itemName={mealData[itemId] ? mealData[itemId].mealName : 'Loading...'}
                                        ratingList={mealData[itemId] ? mealData[itemId].ratings : ''}
                                        itemId={itemId}
                                        alert={alert}
                                        currentUser = {currentUser}
                                        isCheckedIn = {isCheckedIn}
                                        currHall = {hallLocation.state.name}
                                        userID = {accounts[0].homeAccountId}
                                    />
                                ))}
                            </Container>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    switch (diningHall) {
        case 'Hicks':
            return (
                <div>
                    <Menu/>
                </div>
            );
        case 'MAP':
            return (
                <div>
                    <Menu/>
                </div>
            );
        case 'CFA':
            return (
                <CFAMenu/>
            );
        default:
            return (
                <div>
                    <p>Oops: Something went wrong!</p>
                    <p>Couldn't load menu data for {diningHall}</p>
                </div>
            );
    }
}

export const SelectedHall = () => {
    //User Information
    const { instance, accounts } = useMsal();

    // Collection name for firebase. I fill it later in code see line 133
    var hallCollectionName = "";
    const currentUser = accounts[0];

    var CheckInTime = false;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const currentUserQuery = query(
                    collection(firestore, 'users'),
                    where('email', '==', currentUser.username)
                );
                const currentUserSnapshot = await getDocs(currentUserQuery);
                const checkInStore = currentUserSnapshot.docs[0].data().checkInTime;
                const checkHall = currentUserSnapshot.docs[0].data().currentLocation;

                setIsCheckedIn(checkInStore!==0)
                setIsInHall(checkHall===locationName)
            } 
            catch (err) {
                console.log(err);
            }
        };

        fetchData();
    }, []);

    
    // Holds a mock local value for user being checked in or not
    // Helps develop features. Will change this value with cloud value when available
    const [isCheckedIn, setIsCheckedIn] = useState(CheckInTime)
    const [isInHall, setIsInHall] = useState(false)

    //location information
    const hallLocation = useLocation();
    const locationName = hallLocation.state.name
    
    // Changing firestore collection name based on dining hall
    if(locationName==="Hicks Dining Hall"){
        hallCollectionName = "busyness/Hicks/ratings"
    }else if(locationName==="MAP Dining Hall"){
        hallCollectionName = "busyness/MAP/ratings"
    }else if (locationName==="Chick-fil-A"){
        hallCollectionName = "busyness/CFA/ratings"
    }
    
    //// Busyness rating popup

    // This boolean controls showing or not the popup  window to rate the busynesss
    const [showBusynessRating, setShowBusynessRating] = useState(false);

    // Functions handling opening and closing popup clicks
    const openBusynessRating = () => setShowBusynessRating(true);
    const closeBusynessRating = () => setShowBusynessRating(false);

    //// Check in Alert popup

    //This boolean controls showing or not the "Check in first" toast
    const [showCheckInAlert, setShowCheckInAlert] = useState(false);

    // Functions handling opening and closing popup clicks
    const openCheckInAlert = () => {
        if(!isCheckedIn || !isInHall){
            setShowCheckInAlert(true);
        }
    }
    const closeCheckInAlert = () => setShowCheckInAlert(false);

    //// User info update on check in
        const CheckIn = async () => {
            var currTime = Date.now(); //Returns time since epoch in seconds
            const user = accounts[0].homeAccountId
            const usersRef = doc(firestore, 'users', user);

            const currentUserQuery = query(
                collection(firestore, 'users'), // Replace 'firestore' with your actual Firestore instance
                where('email', '==', accounts[0].username)
            );

            const currentUserSnapshot = await getDocs(currentUserQuery);
            const streakStore = currentUserSnapshot.docs[0].data().streak;
            const streakTimeStore = currentUserSnapshot.docs[0].data().streakCheckIn;

            const timeDiff = currTime-streakTimeStore;

            if(timeDiff>86400000)
            {
                await updateDoc(usersRef, 
                    {
                        checkInTime: currTime,
                        currentLocation: hallLocation.state.name,
                        streak: 1,
                        streakCheckIn: currTime
                    })
            }
            else
            {
                await updateDoc(usersRef, 
                    {
                        checkInTime: currTime,
                        currentLocation: hallLocation.state.name,
                        streak: increment(1),
                        streakCheckIn: currTime
                    })
            }
            setIsCheckedIn(true);
        };

    //// Back button
    const history = useNavigate();
    const handleBackButton = () => {
        history("/");
    };

    return (
        <div className="diningHall" style={{height: "100%", width: "100%"}}>
            <h1 style={{ textAlign: 'center', }}> {hallLocation.state.name} </h1>
            {/* <Button variant="link" onClick={handleBackButton}><MdOutlineArrowBackIos style={{height: "3em", width: "3em", color: "#000000"}}/></Button> */}
            <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '300px',
                    marginBottom: "6rem"
            }}>
                <div className="container" style={{height: "300px"}}>
                    <Row>
                        <Col xs={2}>
                            <Button variant="link" onClick={handleBackButton}><MdOutlineArrowBackIos style={{height: "3em", width: "3em", color: "#000000"}}/></Button>
                        </Col>
                        <Col xs={8} >
                            {!isCheckedIn ? (
                                <Button disabled={isCheckedIn} onClick={function events() { openBusynessRating(); }} className="w-100 h-100 redFill redOutline" size="lg" style={{alignContent: "center"}}>
                                    <h2>Check in</h2>
                                </Button>
                            ) : (
                                <Row textAlign="center">
                                    <p></p>
                                </Row>
                                
                            )}
                                
                        </Col>
                        <Col>
                        </Col>
                    </Row>
                    <Meter style={{ alignItems: 'center', alignContent: 'center', textAlign: 'center'}} hall={hallLocation.state.hallID}/> 
                </div>
            </div>
            <div>
                <BusynessRatingPopup ingPopup show={showBusynessRating} handleClose={closeBusynessRating} collectionName={hallCollectionName} setCheckIn={CheckIn}/>
            </div>
            <div>
                <CheckInAlertPopup show={showCheckInAlert} handleClose={closeCheckInAlert} />
            </div>
            <div>
                <div>
                    <br />
                    <DisplayMenuData
                        diningHall={hallLocation.state.hallID}
                        alert={() => {openCheckInAlert()}}
                        isCheckedIn = {isCheckedIn}
                    />
                </div>
            </div>
        </div>
    );
};