import { Button, Modal } from 'react-bootstrap';

export default function CheckInAlertPopup({show, handleClose}) {
  return (
    <>
      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
        closeButton
      >
        <Modal.Header closeButton style={{borderBottom: "transparent"}}>
          <Modal.Title>Sorry!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          You need to be checked in first to rate menu items
        </Modal.Body>
        <Modal.Footer style={{borderTop: "transparent"}}>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}