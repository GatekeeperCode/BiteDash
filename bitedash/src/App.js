import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/Navbar/Navbar';
import { Home } from './pages/Home';
import { Preferences } from './pages/preferences';
import { SelectedHall } from './pages/SelectedHall';
import { SnackbarProvider } from './SnackbarContext';
import { BiteFormProvider } from './BiteFormContext';
// friends list pages
import { FriendsList } from './pages/friendsPages/FriendsList';
import { SearchFriends } from './pages/friendsPages/SearchFriends';
import { PlanABite } from './pages/friendsPages/PlanABite';
import { JoinABite } from './pages/friendsPages/JoinABite';
import React, { useState, useEffect } from 'react';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import './App.css';
import PreLogin from './components/SSO/PreLogin';
import { doc, getDoc, setDoc } from '@firebase/firestore';
import { firestore } from './firebase';


const createUserDocument = async (user) => {
    const userRef = doc(firestore, 'users', user.homeAccountId);
    try {
        const docSnapshot = await getDoc(userRef);
        if (!docSnapshot.exists()) {
            await setDoc(userRef, {
                id: user.homeAccountId,
                checkInTime: 0,
                streakCheckIn: 0,
                currentLocation: "",
                email: user.username,
                name: user.name,
                phoneNumber: "",
                friends: [],
                incomingRequests: [],
                outgoingRequests: [],
                inviteNotification: "",
                prefLocation: "",
                prefNotification: "noNotif",
                prefTimeLunch: "",
                prefTimeDinner: "",
                streak: 0
            });
        }
    } catch (error) {
        console.error("Error writing document: ", error);
    }
};

const fetchData = async (isAuthenticated, accounts, isCreated) => {
    let content = null;
    if (isAuthenticated && !isCreated && accounts.length > 0) {
        const user = accounts[0];
        await createUserDocument(user);

        content = (
            <Router>
                <NavBar />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/friends" element={<FriendsList />} />
                    <Route path="/friends/search-friends" element={<SearchFriends />} />
                    <Route path="/friends/plan-a-bite" element={<PlanABite/>} />
                    <Route path="/friends/join-a-bite" element={<JoinABite />} />
                    <Route path="/preferences" element={<Preferences />} />
                    <Route path="*" element={<h1>PAGE NOT FOUND</h1>} />
                    <Route path='/selectedHall' element={<SelectedHall />} />
                </Routes>
            </Router>
        );
    } else {
        content = <PreLogin />;
    }

    return content;
};

const App = () => {
    const isAuthenticated = useIsAuthenticated();
    const { accounts } = useMsal();
    const [content, setContent] = useState(null);
    const [isCreated] = useState(false);

    useEffect(() => {
        fetchData(isAuthenticated, accounts, isCreated).then(setContent);
    }, [isAuthenticated, accounts, isCreated]);

    return <BiteFormProvider>
        <SnackbarProvider>{content}</SnackbarProvider>
        </BiteFormProvider>
};

export default App;
