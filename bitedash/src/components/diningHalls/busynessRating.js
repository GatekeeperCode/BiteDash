import { Row, Col, Container, Button, Modal, Stack} from 'react-bootstrap';
import { collection, addDoc } from "@firebase/firestore";
import { firestore } from "../../firebase";

export default function BusynessRatingPopup({show, handleClose, collectionName, setCheckIn}){
    /**
     * Send user rating of the busyness to firestore for processing
     * @param {Number} wait wait time to record in Firestore for busyness
     */
    function sendBusynessRating(wait){
        // Timestamp
        const timestamp = Date.now();
        // This is the document to add
        const data = {
            waitTime: wait,
            timestamp: timestamp
        };
        // This adds the document to firestore
        try{
            addDoc(collection(firestore, collectionName), data);
        } catch (error){
        }
        // Set the user as checked in
        setCheckIn();
        // Closes the popup window
        handleClose();
    }

    return (
        <div
          className="modal show"
          style={{ display: 'block', position: 'initial' }}
        >
            <Modal show={show} onHide={handleClose} backdrop="static">
                <Modal.Header closeButton style={{borderBottom: "transparent"}}>
                    <Modal.Title>How long before food?</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Container >
                        <Row>
                            <Col>
                            </Col>
                            <Col>
                                <Stack gap={3}>
                                <Stack direction="horizontal" gap={3}>
                                    <Button style={{width: "100px"}} variant="success" onClick={() => {sendBusynessRating(5)}}>5 mins</Button>
                                    <Button style={{width: "100px"}} variant="success" onClick={() => {sendBusynessRating(10)}}>10 mins</Button>
                                </Stack>
                                <Stack direction="horizontal" gap={3}>
                                    <Button style={{width: "100px"}} variant="warning" onClick={() => {sendBusynessRating(15)}}>15 mins</Button>
                                    <Button style={{width: "100px"}} variant="danger" onClick={() => {sendBusynessRating(30)}}>30 mins</Button>
                                </Stack>
                                </Stack>
                            </Col>
                            <Col>
                            </Col>
                           
                        </Row>
                    </Container>
                </Modal.Body>
                <Modal.Footer style={{borderTop: "transparent"}}>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
        </Modal>
        </div>
      );
}