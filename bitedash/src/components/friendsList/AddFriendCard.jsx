import { Card, Col, Row, Image, Container, Button } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
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

export function AddFriendCard({user, sendFriendRequest, handleSnack}){
    return(
            <Card className="my-card" style={{borderRadius: '15px'}}>
                <Card.Body>
                    <Row style={{width: '100%'}}>
                        <Row style={{width: '95%'}}>
                            <Col className='avatarCol d-flex'>
                                <div className="avatar d-flex align-items-center redFill" style={{ color: "white", textAlign: "center", justifyContent: "center" }}>
                                    <h4 className='avatarText'>{parseFirst(user)}</h4>
                                </div>
                                {/* <h2 className='cardTitle'>{mealInfo.title}</h2> */}
                                <h4 className='cardTitle'>{parseName(user)}</h4>
                            </Col>
                        </Row>
                        <Row style={{width: '5%'}}>
                            <Col>
                                <Row style={{width: '50px'}}>
                                    <Button 
                                        className='redFill redOutline acceptBtn' 
                                        style={{ pointerEvents: 'auto'}} 
                                        onClick={() => { 
                                            sendFriendRequest(); 
                                            handleSnack();
                                            }}>
                                    <FaPlus/>
                                    </Button>
                                </Row>
                            </Col>
                        </Row>
                    </Row>    
                </Card.Body>
            </Card> 
    )
}