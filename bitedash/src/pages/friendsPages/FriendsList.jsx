import { useState, useEffect, Fragment, useContext } from 'react';
import { firestore } from '../../firebase';
import { getDocs, collection, query, where } from "@firebase/firestore";
import { useMsal } from '@azure/msal-react';
import { useNavigate } from 'react-router-dom';
import { SnackbarContext } from '../../SnackbarContext';
import { BiteFormContext } from '../../BiteFormContext';
import Snackbar from '@mui/material/Snackbar';
import FriendStatus from '../../components/friendsList/FriendStatus';
import AddFriendButton from '../../components/friendsList/AddFriendButton';
import PlanABiteButton from '../../components/friendsList/PlanABiteButton';
import ToggleViewButton from '../../components/friendsList/ToggleViewButton';
import InvitesButton from '../../components/friendsList/InvitesButton';
import './friendsPageStyling.css';
import './CalendarStyling.css'
import { momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
//Styling
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { IconButton } from '@mui/material';
import { IoIosClose } from 'react-icons/io';
import { Card, Col, Container, Row } from 'react-bootstrap';
import MyCalendar from './../../components/calendarView/CustomCalendar.jsx';

function PageData({ viewType, setViewType }) {
    const { open, message, closeSnackbar } = useContext(SnackbarContext);
    const [totalFriendRequests, setTotalFriendRequests] = useState(0);
    const [totalInvites, setTotalInvites] = useState(0);
    const [updatePage, setUpdatePage] = useState(0);
    const empty = "none";

    // get user data from firebase
    const [userData, setUserData] = useState([]);
    // current user info
    const { accounts } = useMsal();
    const currentUser = accounts[0];

    useEffect(() => {
        async function fetchData() {
            const data = await fetchFirestoreData(currentUser);
            setUserData(data);
        }
        fetchData();
    }, [updatePage]);

    useEffect(() => {
        async function fetchInvites(){
            const invites = await fetchFirestoreInvites(currentUser);
            setTotalInvites(invites.length);
        }
        fetchInvites();
    }, []);

    useEffect(() => {
        async function fetchTotal() {
            const currentUserQuery = query(
                collection(firestore, 'users'),
                where('email', '==', currentUser.username)
            );
            const currentUserSnapshot = await getDocs(currentUserQuery);
            const friendRequests = currentUserSnapshot.docs[0].data().incomingRequests;
            setTotalFriendRequests(friendRequests.length);
        };
        fetchTotal();
    }, []);


    // when called, navigate to /friends/{route}
    const navigate = useNavigate();
    const onSelect = (route) => {
        navigate(route);
    };

    const onInvite = (route, state) => {
        navigate(route, state);
    };


    // // CALENDAR

    // Tracks current time
    const localizer = momentLocalizer(moment);

    // Events
    const [events, setEvents] = useState([]);
    useEffect(() => {
        async function fetchEvents() {
            const fetchedEvents = await fetchCalendarEvents(currentUser.name);
            setEvents(fetchedEvents);
        }
        fetchEvents();
    }, [updatePage]);

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
    );

    if (viewType) {
        return (
            <div className='container extender'>
                <div className='row'>
                    <div className='col' id='column'>
                        <ToggleViewButton
                            viewType={viewType}
                            setViewType={setViewType}
                        />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }} className='col'>
                        <InvitesButton value={totalInvites} onSelect={() => onSelect('join-a-bite')} />
                    </div>
                    <PlanABiteButton onSelect={() => onInvite('plan-a-bite', {state: {name: empty}})} />
                </div>
                <Container style={{ paddingTop: "1rem !important" }} >
                    <Row>
                        <Col></Col>
                        <div className='col-14'>
                            <Card style={{height: "32rem", overflowY: "scroll"}}>
                                <Card.Header style={{}}> <h2>Friends</h2></Card.Header>
                                <Card.Body style={{}}>
                                    <ul id='friends-list' style={{}}>
                                        <Row>
                                            <Col></Col>
                                            <Col md={12}>
                                                {userData.map((user, index) => (
                                                    <FriendStatus
                                                        key={index}
                                                        currentUser={currentUser}
                                                        friend={user}
                                                        status={user.currentLocation}
                                                        setUpdatePage={setUpdatePage}
                                                        updatePage={updatePage}
                                                    />
                                                ))}
                                            </Col>
                                            <Col></Col>
                                        </Row>

                                    </ul>
                                </Card.Body>
                            </Card>
                        </div>
                        <Col></Col>
                    </Row>
                </Container>

                <AddFriendButton onSelect={() => onSelect('search-friends')} totalRequests={totalFriendRequests}/>
                <Snackbar
                    open={open}
                    autoHideDuration={5000}
                    onClose={closeSnackbar}
                    message={message}
                    action={action}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                />
            </div>
        );
    } else {
        return (
            <div className='container padder'>
                <div className='row'>
                    <div className='col' id='column'>
                        <ToggleViewButton
                            viewType={viewType}
                            setViewType={setViewType}
                        />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }} className='col'>
                        <InvitesButton value={totalInvites} onSelect={() => onSelect('join-a-bite')} />
                    </div>
                    <PlanABiteButton onSelect={() => 
                        onInvite('plan-a-bite', {state: {name: empty}})
                        } />
                </div>
                <div className='Container' style={{ height: '600px' }}>
                    <MyCalendar 
                        localizer={localizer}
                        events={events}
                        currentUser={currentUser}
                        updatePage={updatePage}
                        setUpdatePage={setUpdatePage}
                    />
                </div >
                <Snackbar
                    open={open}
                    autoHideDuration={5000}
                    onClose={closeSnackbar}
                    message={message}
                    action={action}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                />
            </div>
        )
    };

}

async function fetchCalendarEvents(currentUserName) {
    // All meals user is invited to
    const userMealsInvitedQuery = query(
        collection(firestore, 'bite'),
        where('accepted', 'array-contains', currentUserName)
    );
    const userMealsInvitedSnapshot = await getDocs(userMealsInvitedQuery);
    const mealsInvited = []; // List of the documents
    userMealsInvitedSnapshot.forEach(meal => {
        mealsInvited.push(meal.data());
    });

    // Creatings Events from the documents
    const eventsInvited = [];
    mealsInvited.forEach(bite => {
        eventsInvited.push({
            start: bite.start_time.toDate(),
            end: bite.end_time.toDate(),
            title: bite.title,
            location: bite.location,
            owner: bite.owner,
            accepted: bite.accepted,
            invited: bite.invited,
            timestamp: bite.timestamp
        });
    });

    // All meals user created
    const userMealsOwnedQuery = query(
        collection(firestore, 'bite'),
        where('owner', '==', currentUserName)
    );
    const userMealsOwnedSnapshot = await getDocs(userMealsOwnedQuery);
    const mealsOwned = []; // list of the documents
    userMealsOwnedSnapshot.forEach(meal => {
        mealsOwned.push(meal.data());
    });
    // Creatings Events from the list of documents
    const eventsOwned = [];
    mealsOwned.forEach(bite => {
        eventsOwned.push({
            start: bite.start_time.toDate(),
            end: bite.end_time.toDate(),
            title: bite.title,
            location: bite.location,
            owner: bite.owner,
            accepted: bite.accepted,
            invited: bite.invited,
            timestamp: bite.timestamp
        });
    });

    // Resulting list of meals
    return eventsInvited.concat(eventsOwned);
}

async function fetchFirestoreData(currentUser) {
    const currentUserQuery = query(
        collection(firestore, 'users'),
        where('email', '==', currentUser.username)
    );
    const currentUserSnapshot = await getDocs(currentUserQuery);
    const friendsEmails = currentUserSnapshot.docs[0].data().friends;

    const friendsPromises = friendsEmails.map(email => {
        const myFriendsQuery = query(
            collection(firestore, 'users'),
            where('email', '==', email)
        );
        return getDocs(myFriendsQuery).then(myFriendsSnapshot => {
            const friends = [];
            myFriendsSnapshot.forEach(doc => {
                friends.push({ id: doc.id, ...doc.data() });
            });
            return friends;
        });
    });

    const allFriendsData = await Promise.all(friendsPromises);
    const myFriends = allFriendsData.flat();

    return myFriends;
}


async function fetchFirestoreInvites(currentUser) {
    const bitesCollection = collection(firestore, "bite");
    const querySnapshot = await getDocs(bitesCollection);

    const bites = [];

    querySnapshot.forEach((doc) => {
        const invitedUsers = doc.data().invited;

        if (invitedUsers.includes(currentUser.name)) {
            bites.push({ id: doc.id, ...doc.data() });
        }
    });

    return bites;
}

export const FriendsList = () => {
    // View and setView keep track of where the user is in calendar or list view
    const { view, setView } = useContext(BiteFormContext);

    return (
        <PageData
            viewType={view}
            setViewType={setView}
        />
    )
}