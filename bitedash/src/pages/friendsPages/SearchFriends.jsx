import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { getDocs, collection, query, where, arrayRemove, arrayUnion, updateDoc, doc } from "@firebase/firestore";
import { firestore } from '../../firebase';
import Navbar from 'react-bootstrap/Navbar';
import LeavePageButton from '../../components/friendsList/ExitButton';
import FriendRequest from '../../components/friendsList/FriendRequest';
import SearchBar from '../../components/friendsList/SearchBar';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import './friendsPageStyling.css';

export const SearchFriends = () => {
    let history = useNavigate();
    const { accounts } = useMsal();
    const currentUser = accounts[0];

    const [incomingRequests, setIncomingRequests] = useState([]);
    const [updatePage, setUpdatePage] = useState(0);

    useEffect(() => {
        async function fetchData() {
            const data = await fetchFirestoreData(currentUser);
            setIncomingRequests(data);
        }
        fetchData();
    }, [updatePage]);

    async function acceptFriendRequest(user) {
        var myUserRef, friendRef;
        try {
            const currentUserDoc = await getCurrentUserDocument(currentUser);
            myUserRef = doc(firestore, "users", currentUserDoc.docs[0].id);
            const userDoc = await getUserDocument(user);
            friendRef = doc(firestore, 'users', userDoc.docs[0].id);
        }
        catch (e) {
            console.log("Issue with finding requests in DB: ", e);
        }

        // remove from incoming / outgoing and add to friends array
        try {
            await updateDoc(myUserRef, {
                incomingRequests: arrayRemove(user.email),
                friends: arrayUnion(user.email)
            });
            await updateDoc(friendRef, {
                outgoingRequests: arrayRemove(currentUser.username),
                friends: arrayUnion(currentUser.username)
            });
        }
        catch (e) {
            console.log("Issue with adding friend: ", e);
        }
        setUpdatePage(updatePage + 1);
    } 

    async function denyFriendRequest(user) {
        var myUserRef, friendRef;
        try {
            const currentUserDoc = await getCurrentUserDocument(currentUser);
            myUserRef = doc(firestore, "users", currentUserDoc.docs[0].id);
            const userDoc = await getUserDocument(user);
            friendRef = doc(firestore, 'users', userDoc.docs[0].id);
        }
        catch (e) {
            console.log("Issue with finding requests in DB: ", e);
        }
        try {
            // remove from my incoming requests
            await updateDoc(myUserRef, {
                incomingRequests: arrayRemove(user.email)
            });
            // remove from user's outgoing requests
            await updateDoc(friendRef, {
                outgoingRequests: arrayRemove(currentUser.username)
            });
        }
        catch (e) {
            console.log("Issue with denying friend request: ", e);
        }
        setUpdatePage(updatePage + 1);
    }

    return (

        <div style={{overflow: "hidden"}}>
            <Container className='results-scrollable'>
                <Row>
                    <Col style={{width: '10vw'}}><LeavePageButton onClick={() => history("/friends")}></LeavePageButton></Col>
                    <Col style={{width: '80vw'}}>
                        <Row style={{height: '15%'}}></Row>
                        <Row style={{height: '70%', textAlign: 'center'}}><h1 >Friends</h1></Row>
                        <Row style={{height: '15%'}}></Row>
                    </Col>
                    <Col style={{width: '10vw'}}></Col>
                </Row>
                <Navbar className="bg-body-tertiary justify-content-center">
                <SearchBar/>
                </Navbar>
                <h3 style={{color: 'grey'}}>Friend requests</h3>
                {incomingRequests.map((user, index) => (<>
                    <FriendRequest 
                        key={index}
                        profilePicture={null}
                        username={user.name}
                        addFriend={() => acceptFriendRequest(user)}
                        denyFriend={() => denyFriendRequest(user)}
                    /><br/></>
                ))}
            </Container>
            
           
        </div>
    );
}

async function getCurrentUserDocument(currentUser) {
    const currentUserQuery = query(
        collection(firestore, 'users'),
        where('email', '==', currentUser.username)
    );

    return await getDocs(currentUserQuery);
}

async function getUserDocument(user) {
    const userQuery = query(
        collection(firestore, 'users'),
        where('email', '==', user.email)
    );

    return await getDocs(userQuery);
}

async function fetchFirestoreData(currentUser) {
    const currentUserSnapshot = await getCurrentUserDocument(currentUser);
    const incomingRequests = currentUserSnapshot.docs[0].data().incomingRequests;

    const requests = [];
    for (let email of incomingRequests) {
        const requestQuery = query(
            collection(firestore, 'users'),
            where('email', '==', email)
        );
        const incomingUsersSnapshot = await getDocs(requestQuery);
        incomingUsersSnapshot.forEach((doc) => {
            requests.push({ id: doc.id, ...doc.data() });
        });
    };

    return requests;
}