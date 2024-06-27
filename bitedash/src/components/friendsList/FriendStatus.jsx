import { useState } from 'react';
import { Button, Col, Container, Row, Modal, Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { BsThreeDotsVertical } from "react-icons/bs";
import { firestore } from '../../firebase';
import { getDocs, collection, query, where, arrayRemove, updateDoc, doc } from "@firebase/firestore";
import "./friendsStyle.css"

export default function FriendStatus({ currentUser, friend, status, setUpdatePage, updatePage }) {
    const friendName = parseName();
    const friendInitials = parseFirst();
    const [showModal, setShowModal] = useState(false);

    function parseName() {
        const nameParts = friend.name.split(',');
        const firstName = nameParts[1];
        const lastName = nameParts[0];
    
        return firstName.slice(0, -3).concat(" ", lastName).trim();
    }

    function parseFirst() {
        const nameParts = friend.name.split(',');
        const firstName = nameParts[1];
        const lastName = nameParts[0];
    
        return firstName[1].concat(lastName[0]);
    }

    const navigate = useNavigate();
    const onInvite = (route, state) => {
        navigate(route, state);
    };

    function handleOpenModal() {
        setShowModal(true);
    }

    function handleCloseModal() {
        setShowModal(false);
    }

    async function removeFriend() {
        var myUserRef, friendRef;
        
        const currentUserDoc = await getCurrentUserDocument(currentUser);
        myUserRef = doc(firestore, "users", currentUserDoc.docs[0].id);
        const userDoc = await getUserDocument(friend);
        friendRef = doc(firestore, 'users', userDoc.docs[0].id);

        try {
            await updateDoc(myUserRef, {
                friends: arrayRemove(friend.email)
            });
            await updateDoc(friendRef, {
                friends: arrayRemove(currentUser.username)
            });
        }
        catch (e) {
            console.log("Issue with removing friend: ", e);
        }

        setUpdatePage(updatePage + 1);
    }

    return (
        <li>
            <Container className="d-flex justify-content-between">
                <Button variant='light' size='lg' type='btn-block' className='fullWidth' style={{borderRadius: '5px 0 0 5px'}}>
                    <Row>
                        <Col className='avatarCol d-flex'>
                            <div className="avatar d-flex align-items-center redFill" style={{ color: "white", textAlign: "center", justifyContent: "center" }}>
                                <h4 className='avatarText'>{friendInitials}</h4>
                            </div>
                            <div className='ms-1' style={{textAlign: 'left', padding: '2px'}}>
                                {friendName}
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col style={{textAlign: 'left'}}>
                            {status === 'None' ? 'Not currently eating' : `Is eating at: ${status}`}
                        </Col>
                    </Row>

                </Button>

                <Dropdown>
                    <Dropdown.Toggle variant='light' size='lg' style={{ height: '100%', borderRadius: '0 5px 5px 0' }}>
                        <BsThreeDotsVertical />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item onClick={() => 
                            onInvite('plan-a-bite', {state: {name: friend}})
                        }>
                            Invite to Bite
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item onClick={handleOpenModal}>
                            Remove Friend
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </Container>

            <Modal 
                show={showModal} 
                onHide={handleCloseModal}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Remove Friend</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Container fluid>
                        <Row>
                            <Col md="auto">
                                Are you sure you want to remove {friendName}?
                            </Col>
                            <Col md="auto">
                                <Button variant="danger" 
                                    onClick={() => {
                                        handleCloseModal();
                                        removeFriend();
                                    }
                                }>
                                    Remove
                                </Button>
                            </Col>                
                        </Row>
                    </Container>
                </Modal.Body>
            </Modal>
        </li>
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