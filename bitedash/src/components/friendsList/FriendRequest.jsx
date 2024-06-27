import { Col, Row, Container, Image, Card, Button } from 'react-bootstrap';
import './InviteStyle.css';

function parseName(fullName) {

    try {
        const nameParts = fullName.split(',');
        const firstName = nameParts[1];
        const lastName = nameParts[0];
    
        return firstName.slice(0, -3).concat(" ", lastName).trim();
    }
    catch (e) {
        console.log(e);
    }
    return "Name not found";
}

function parseFirst(fullName) {
    try {
        const nameParts = fullName.split(',');
        const firstName = nameParts[1];
        const lastName = nameParts[0];
    
        return firstName[1].concat(lastName[0]);
    }
    catch (e) {
        console.log(fullName);
        console.log(e);
    }
    return "Name not found";
}

export default function FriendRequest({ profilePicture, username, addFriend, denyFriend }) {
    return (
            <Card className="my-card" style={{borderRadius: '15px'}}>
                <Card.Body>
                        <Row style={{width: '100%'}}>
                            <Col className='avatarCol d-flex'>
                                <div className="avatar d-flex align-items-center redFill" style={{ color: "white", textAlign: "center", justifyContent: "center" }}>
                                    <h4 className='avatarText'>{parseFirst(username)}</h4>
                                </div>
                                {/* <h2 className='cardTitle'>{mealInfo.title}</h2> */}
                                <h4 className='cardTitle'>{parseName(username)}</h4>
                            </Col>
                        </Row>
                        <br />
                        <Row style={{width: '100%'}}>
                                <Row style={{width: '45%'}}>
                                    <Button style={{backgroundColor: "#cc0000", borderColor: "#cc0000"}} onClick={addFriend}>Accept</Button>
                                </Row>
                                <Row style={{width: '10%'}}></Row>
                                <Row style={{width: '45%'}}>
                                    <Button variant="outline-danger"  onClick={denyFriend}>Deny</Button>
                                </Row>
                        </Row>
                </Card.Body>
            </Card>
                
    )
}