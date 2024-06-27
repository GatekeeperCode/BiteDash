import { firestore } from '../../firebase';
import { useEffect, useState, useContext } from 'react';
import { collection, getDocs, query, arrayUnion, updateDoc, doc, where } from '@firebase/firestore';
import { useMsal } from '@azure/msal-react';
import { Dropdown, Form, Row } from 'react-bootstrap';
import { SnackbarContext } from '../../SnackbarContext';
import { AddFriendCard } from './AddFriendCard';

export default function SearchBar() {
    const [searchInput, setSearchInput] = useState('');
    const { accounts } = useMsal();
    const [otherUsers, setOtherUsers] = useState([]);

    const currentUser = accounts[0];

    const { openSnackbar} = useContext(SnackbarContext);

    const handleSnack = () => {
        setSearchInput("");
        openSnackbar("Friend Request Sent");
    }


    const handleChange = (e) => {
        e.preventDefault();
        setSearchInput(e.target.value);
    };

    useEffect(() => {
        async function getUserData() {
            const q = query(
                collection(firestore, 'users'),
                where('email', '!=', currentUser.username)
            );
            const querySnapshot = await getDocs(q);
            let users = querySnapshot.docs.map(doc => ({
                ...doc.data(), id: doc.id
            }));
            
            users = users.filter(user => user.name.toLowerCase().includes(searchInput.toLowerCase()));
            setOtherUsers(users);
        };
        getUserData();
    }, [searchInput]);
    
    function sendFriendRequest(account) {
        const userRef = doc(firestore, 'users', account.id);
        updateDoc(userRef, {
            incomingRequests: arrayUnion(currentUser.username)
        });

        const myUserRef = doc(firestore, 'users', currentUser.homeAccountId);
        updateDoc(myUserRef, {
            outgoingRequests: arrayUnion(account.email)
        });
    }

    return (
        <div style={{width: '90vw'}}>
                <Form.Control
                    type="text"
                    placeholder='Search for Friends'
                    value={searchInput}
                    onChange={handleChange}
                />
                <br />
            {searchInput && (
                <Dropdown>
                    {otherUsers.slice(0, 4).map(user => (
                        <div>
                            <Dropdown.Item key={user.email} className="p-1" style={{pointerEvents: 'none'}}>
                                <Row>
                                    <AddFriendCard 
                                        user={user.name}
                                        sendFriendRequest = {() =>{sendFriendRequest(user)}}
                                        handleSnack = {() => {handleSnack()}}
                                    />
                                </Row>
                            </Dropdown.Item>

                        </div>
                    ))}
                </Dropdown>
            )}
        </div>
    );
}
   