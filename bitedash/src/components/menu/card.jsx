import { Card, Button, Container, Row, Col, ProgressBar } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { FiThumbsUp, FiThumbsDown } from "react-icons/fi";
import './card.css'
import { updateDoc, doc, getDoc, increment, arrayRemove, arrayUnion, Timestamp  } from '@firebase/firestore'
import { firestore } from '../../firebase';

export default function MenuItem({ itemName, itemId, alert, currentUser, isCheckedIn, currHall, userID }) {
    const [rating, setRating] = useState(null);
    const [thumbsUp, setThumbsUp] = useState(false);
    const [thumbsDown, setThumbsDown] = useState(false);
    const [oldRating, setOldRating] = useState(null);
    const[noData, setNoData] = useState(false);
    
    //Initializing rating from firestore
    useEffect(() => {
        fetchRating(itemId);
    }, []);
    // This will bring back what you rated before (on another device or earlier)
    useEffect(() => {
            getOldRating(itemId, currentUser).then(() => {
                if(oldRating != null){
                    if(oldRating.value == 1){
                        setThumbsUp(true);
                        setThumbsDown(false);
                    }else{
                        setThumbsUp(false);
                        setThumbsDown(true);
                    }
                }else{
                }
            });
    },[oldRating]);

    /**
     * This method will return None, or the previous rating
     * @param {*} id id of the menu item
     * @param {string} currentUser current user
     */
    async function getOldRating(id, currentUser){
        id = id.toString();
        // Get document to update
        const docRef = doc(firestore, 'meals', id);
        //will hold the old rating
        var old = null;
        // Getting the meal document
        const meal = (await getDoc(docRef)).data()
        try{
            meal.ratingsV2.forEach(rating => {
                if (rating.user == currentUser) {
                    old = rating;
                    setOldRating(old);
                }
            });
        }catch(error){
            setNoData(true);
        }
        
    }

    /**
     * Updates the rating button color and the rating in the db
     */
    async function rateUp() {
        const docRef = doc(firestore, 'users', userID);
        const hall = (await getDoc(docRef)).data().currentLocation;

        if (isCheckedIn && (hall === currHall)){
            if(!thumbsUp)
            {
                updateMealRating(itemId, 1, currentUser, false).then(() => {
                    fetchRating(itemId).then(() =>{
                        setThumbsUp(true);
                        setThumbsDown(false);
                    });
                });
            }
            else
            {
                updateMealRating(itemId, 0, currentUser, true).then(() => {
                    fetchRating(itemId).then(() =>{
                        setThumbsUp(false);
                        setThumbsDown(false);
                    });
                });
            }
        }else{
            alert();
        }
    }

    /**
     * Updates the rating button color and the rating in the db
     */
    async function rateDown() {
        const docRef = doc(firestore, 'users', userID);
        const hall = (await getDoc(docRef)).data().currentLocation;

        if(isCheckedIn && (hall === currHall)){
            if(!thumbsDown)
            {
                updateMealRating(itemId, 0, currentUser, false).then(() =>{
                    fetchRating(itemId).then(() => {
                        setThumbsUp(false);
                        setThumbsDown(true);
                    });
                });
            }
            else
            {
                updateMealRating(itemId, 1, currentUser, true).then(() =>{
                    fetchRating(itemId).then(() => {
                        setThumbsUp(false);
                        setThumbsDown(false);
                    });
                });
            }
        }else{
            alert();
        }
        
    }

    /**
     * Fetches the rating of a menu item
     * @param {*} id of the menu item
     */
    async function fetchRating(id){
        // Meal id
        id = id.toString();
        // Get document to update
        const docRef = doc(firestore, 'meals', id);
        // Getting the meal document
        const meal = (await getDoc(docRef)).data();
        try{
            const upVotes = meal.up;
            const downVotes = meal.down;
            if (upVotes == 0 && downVotes == 0){
                setRating(-1); // The item was never rated before
            }else{
                setRating(meal.rating);
            }
        }catch(error){
            setNoData(true);
        }
        
    }

    /**
     * This will update the rating of a menu item in the database
     * @param {*} id id of the menu item to update
     * @param {Number} rating value of the rating should be 0 or 1
     * @param {string} currentUser current user of the app
     * @param {Bool} unvote true if user removed vote, false if new vote
     */
    async function updateMealRating(id, rating, currentUser, unvote){
        id = id.toString();
        // Get document to update
        const docRef = doc(firestore, 'meals', id);
        // Getting the meal document
        const meal = (await getDoc(docRef)).data();
        // Getting the user's old rating to update it
        var oldRating = null;
        meal.ratingsV2.forEach(rating => {
            if (rating.user == currentUser) {
                oldRating = rating;
            }
        });

        // If the user is changing his rating value
        if (oldRating != null && oldRating.value != rating){
            if(oldRating.value == 1){
                (await updateDoc(docRef, {
                    up: increment(-1)
                }))
            }else{
                (await updateDoc(docRef, {
                    down: increment(-1)
                }))
            }
            (await updateDoc(docRef, {
                ratingsV2: arrayRemove(oldRating)
            }))
            oldRating = null;    
        }
        
        // Adding the new rating if need
        if(!unvote)
        {
            if(oldRating == null){
                // Update the appropriate count
                if(rating == 1){
                    (await updateDoc(docRef, {
                        up: increment(1)
                    }));
                }else{
                    updateDoc(docRef, {
                        down: increment(1)
                    });
                }
                // Updating rating array
                (await updateDoc(docRef, {
                    ratingsV2: arrayUnion({
                        timestamp: Timestamp.now() ,
                        user: currentUser,
                        value: rating
                    })
                }));
            }
        }

        // New rating computation and update
        const newMeal = (await getDoc(docRef)).data();
        const upVotes = newMeal.up;
        const downVotes = newMeal.down;
        // This algorithm works. Trust!
        const newRating = Math.round((upVotes+3)/(upVotes+(downVotes*2)+3) * 100);
        (await updateDoc(docRef, {
            rating: newRating
        }));
    }

    if (noData){
        return(
            <Card className="mb-3 shadow-sm menuCard" style={{ borderRadius: '15px'}}>
            <Card.Body>
                <Container>
                <Card.Title className='menuCardText'>
                              Menu not available
                </Card.Title>
                </Container>
            </Card.Body>
        </Card>
        )
    }else{
        return (
            <Card className="mb-3 shadow-sm menuCard" style={{ borderRadius: '15px'}}>
                <Card.Body>
                    <Container>
                        <Row>
                            {/* Title */}
                            <Col lg={9} xs={6}>
                                <Card.Title className='menuCardText'
                                // style={{ color: '#5a5a5a' }}
                                >
                                    {itemName}
                                </Card.Title>
                            </Col>
                            <Col lg={3} xs={6}>
                                {/* Percentage/Rating Visual */}
                                { rating != null ? rating == -1 ? 
                                        (
                                        <ProgressBar  now={100} label='no rating' variant='info'  />
                                        ) :
                                        (
                                        <ProgressBar className='progress-rating' now={rating} label={`${rating}%`} variant={rating >= 80 ? "success" : rating > 50 ? "warning" : "danger"} style={{ borderRadius: '25px' }}/>
                                    ) : (
                                        <ProgressBar  now={100} striped animated variant='info' />
                                    )}
    
                                {/* Buttons */}
                                <div>
                                <Row className="mt-2 justify-content-center">
                                    <Col xs="auto">
                                        <Button className={thumbsDown?'btn-down-voted' : 'btn-custom-down'}  onClick={rateDown} ><FiThumbsDown /></Button>
                                    </Col>
    
                                    <Col xs="auto">
                                        <Button className={thumbsUp?'btn-up-voted' : 'btn-custom-up'}  onClick={rateUp} ><FiThumbsUp /></Button>
                                    </Col>
                                </Row></div>
                            </Col>
                        </Row>
                    </Container>
                </Card.Body>
            </Card>
        );
    }
    
}
