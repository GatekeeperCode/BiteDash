import { Card, Button, Container, Row, Col, ProgressBar } from 'react-bootstrap';
import './card.css'

export default function CFAItem({ itemName, itemPic }) {
    return (
        <Card className="mb-3 shadow-sm menuCard" style={{ borderRadius: '15px'}}>
            <Card.Body>
                <Container fluid>
                    <Row>
                        <Col lg={9} xs={6}>
                            <Card.Title className='menuCardText'>
                                {itemName}
                            </Card.Title>
                        </Col>
                        <Col>
                            <img 
                                src={itemPic} alt={`${itemName} picture`} 
                                style={{
                                    maxWidth: '110px',
                                    maxHeight: '110px', 
                                }}
                            />
                        </Col>
                    </Row>
                </Container>
            </Card.Body>
        </Card>
    );
}