import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useContext, Fragment} from 'react';
import { useMsal } from '@azure/msal-react';
import { getDocs, collection, arrayRemove, arrayUnion, updateDoc, doc } from "@firebase/firestore";
import { IconButton } from '@mui/material'
import { IoIosClose } from 'react-icons/io'
import { firestore } from '../../firebase';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import './friendsPageStyling.css';
import LeavePageButton from '../../components/friendsList/ExitButton';
import MealInviteCard from '../../components/friendsList/MealInviteCard';
import { SnackbarContext } from '../../SnackbarContext';
import Snackbar from '@mui/material/Snackbar';

export const JoinABite = () => {
    let history = useNavigate();
    const { accounts } = useMsal();
    const currentUser = accounts[0];
    const { open, message, closeSnackbar, openSnackbar } = useContext(SnackbarContext);

    const [bites, setBites] = useState([]);
    const [updatePage, setUpdatePage] = useState(0);

    useEffect(() => {
        async function fetchData() {
            const data = await fetchFirestoreData(currentUser);
            setBites(data);
        }
        fetchData();
    }, [updatePage]);

    const action = (
        <Fragment>
            <IconButton
                size="medium"
                aria-label="close"
                color="inherit"
                onClick={closeSnackbar}
            >
                <IoIosClose fontSize="xx-large" />
            </IconButton>
        </Fragment>
    )

    function parseName(fullName) {

        try {
            const nameParts = fullName.split(',');
            const firstName = nameParts[1];
            const lastName = nameParts[0];
            
            return firstName.slice(0, -3).concat(" ", lastName).trim();
        }
        catch (e) {
            console.log(fullName);
            console.log(e);
        }
        return "Name not found";
    }

    async function acceptInvite(bite) {
        const biteDocRef = doc(firestore, 'bite', bite.id);
        try {
            await updateDoc(biteDocRef, {
                accepted: arrayUnion(currentUser.name)
            });
            await updateDoc(biteDocRef, {
                invited: arrayRemove(currentUser.name)
            });
        }
        catch (e) {
            console.log(e);
        }
        const owner = parseName(bite.owner);
        openSnackbar("Joined " + owner + "'s bite");
        setUpdatePage(updatePage + 1);
    }

    async function declineInvite(bite) {
        const biteDocRef = doc(firestore, 'bite', bite.id);
        try {
            await updateDoc(biteDocRef, {
                invited: arrayRemove(currentUser.name)
            });
        }
        catch (e) {
            console.log(e);
        }
        const owner = parseName(bite.owner);
        openSnackbar("Denied " + owner + "'s invite");
        setUpdatePage(updatePage + 1);
    }

    return (
        <div className="noOver" style={{overflow: "hidden !important"}}>
            <Container fluid className='stayAtTop'>
                <Row className="justify-content-md-center">
                    <Col className="btn-block">
                        <LeavePageButton onClick={() => history("/friends")} className="btn-block"></LeavePageButton>
                    </Col>
                    <Col xs={5} className="titleText">
                        <h1 className="titleText">Join a Bite</h1>
                    </Col>
                    <Col >
                    </Col>
                </Row>
                <hr id="topLine" className="solid" />
            </Container>
            <Container fluid>
                <div className='bottomExt'>
                    <Row>
                        <Col>
                            {bites.length > 0 ? (
                                bites.map((bite, index) => (
                                    <MealInviteCard
                                    key={index}
                                    mealInfo={bite}
                                    acceptInvite={() => acceptInvite(bite)}
                                    declineInvite={() => declineInvite(bite)}
                                    />
                                ))
                                ) : (
                                <p className='aligner'>No current Invites!</p>
                            )}
                        </Col>
                    </Row>
                </div>
            </Container>
            <Snackbar
                open={open}
                autoHideDuration={5000}
                onClose={closeSnackbar}
                message={message}
                action={action}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                style={{ bottom: "6rem !important" }}
            />
        </div>
    );
}

async function fetchFirestoreData(currentUser) {
    const bitesCollection = collection(firestore, "bite");
    const querySnapshot = await getDocs(bitesCollection);

    const bites = [];

    querySnapshot.forEach((doc) => {
        const invitedUsers = doc.data().invited;

        if (invitedUsers.includes(currentUser.name)) {
            bites.push({ id: doc.id, ...doc.data() });
        }
    });

    return bites;
}