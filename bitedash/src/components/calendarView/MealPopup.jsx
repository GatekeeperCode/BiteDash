import { Button, Modal, Badge, Stack, Row, Col } from 'react-bootstrap';
import { arrayRemove, arrayUnion, updateDoc, doc, getDoc } from "@firebase/firestore";
import moment from 'moment';
import { firestore } from '../../firebase';
import "./../friendsList/friendsStyle.css"



export default function MealPopup({ show, handleClose, event, currentUser, updatePage, setUpdatePage }) {
	const endTime = new Date(event.start.getTime());
	const formattedTime = moment(endTime).format('h:mm A');

	async function leaveBite() {
		const biteDocRef = doc(firestore, 'bite', event.timestamp.toString());
		try {
			const biteDocSnapshot = await getDoc(biteDocRef);
			const biteDocData = biteDocSnapshot.data();
			if (biteDocData.owner !== currentUser.name) {
				await updateDoc(biteDocRef, {
					accepted: arrayRemove(currentUser.name)
				});
				await updateDoc(biteDocRef, {
					invited: arrayUnion(currentUser.name)
				});
			} else {
				console.log("Error: The current user is the owner of the bite.");
			}
		}
		catch (e) {
			console.log("Error leaving bite: ", e);
		}
		setUpdatePage(updatePage + 1);
	}

	return (
		<>
		<Modal
			show={show}
			onHide={handleClose}
			backdrop="static"
			keyboard={false}
		>
			<Modal.Header className='topText'>
			<Modal.Title><h1 className='topText'>{event.title}</h1></Modal.Title>
			</Modal.Header>
			<Modal.Body>
			<hr/>
				<h2>Dining Hall: {event.location}</h2>
				<hr/>
				<h3> Bite Creator: {event.owner}</h3>
				<hr/>
				<h5>Date: {event.start.toDateString()}</h5>
				<h5>Time: {formattedTime}</h5>
				<hr/>
				<h5>Invited:</h5>
				{
					<Row className='rowPad'>
					{event.invited.length > 0 ?
					(<Stack direction="vertical" gap={1}>
						{event.invited.map((user) => (
						<Col key={user} xs={5}>
							<Badge pill className="badger">
							{user}
							</Badge>
						</Col>
						))}
					</Stack>) :
					(<p>No more invites!</p>)
					}
					</Row>
				}
				<h5>Accepted:</h5>
				{
					<Row className='rowPad'>
					{event.accepted.length > 0 ?
					(<Stack direction="vertical" gap={1}>
						{event.accepted.map((user) => (
						<Col key={user} xs={5}>
							<Badge pill className="badger">
							{user}
							</Badge>
						</Col>
						))}
					</Stack>) :
					(<p>No more invites!</p>)
					}
					</Row>
				}
			<hr/>
			</Modal.Body>
			<Modal.Footer>
				<Button
					className='redOutline fw-bold'
					style={{borderWidth: "2px", backgroundColor: "white", color: "#cc0000"}}
					onClick={() => {
						leaveBite();
						handleClose();
					}}
				>
					Leave Bite
				</Button>
				<Button className='redFill redOutline' variant="secondary" onClick={handleClose}>
					Close
				</Button>
			</Modal.Footer>
		</Modal>
		</>
	);
}