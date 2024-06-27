import { Container, Row, Col, Card, Button } from 'react-bootstrap';
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



function parseTime(time) {
    const seconds = time.seconds;
    const nanoseconds = time.nanoseconds;
    const totalMilliseconds = (seconds * 1000) + (nanoseconds / 1000000);
    return new Date(totalMilliseconds);
}

export default function MealInviteCard({ mealInfo, acceptInvite, declineInvite }) {


    return (
        <div class="card-container">
        <Card className="my-card" style={{ overflow: "hidden !important" }}>
            <Card.Body>
                <Row>
                    <Col className='avatarCol d-flex'>
                        <div className="avatar d-flex align-items-center redFill" style={{ color: "white", textAlign: "center", justifyContent: "center" }}>
                            <h4 className='avatarText'>{parseFirst(mealInfo.owner)}</h4>
                        </div>
                        {/* <h2 className='cardTitle'>{mealInfo.title}</h2> */}
                        <h4 className='cardTitle'>{parseName(mealInfo.owner)}</h4>
                    </Col>
                </Row>
                <div className="top-right">
                    <h5>{parseTime(mealInfo.start_time).toLocaleDateString()}</h5>
                    <p>{mealInfo.accepted.length} / {mealInfo.invited.length + mealInfo.accepted.length}</p>
                </div>
                <Row className="mt-3">
                    <Col>
                        <h4>{mealInfo.title}</h4>
                        {/* <h5>{parseName(mealInfo.owner)}</h5> */}
                        <h5>{mealInfo.location}: {parseTime(mealInfo.start_time).toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})}</h5>
                    </Col>
                    <Col xs={6} className="button-container">
                        <Button className='redFill redOutline acceptBtn' onClick={acceptInvite}>Accept</Button>
                        <Button className='emptyRedButton redOutline' onClick={declineInvite}>Decline</Button>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
        </div>
    );
}