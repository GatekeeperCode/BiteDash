import React, { useState, useEffect } from "react";
import Carousel from 'react-bootstrap/Carousel';
import { useNavigate } from "react-router-dom";
import '../App.css';
import { getFirestore, getDoc, doc } from "@firebase/firestore";
import chickfilapic from "../images/chickfilapic.jpg"
import hicks from "../images/hicks.jpg"
import mapinside from "../images/mapinside.jpg"


export const Home =  () => {
    const db = getFirestore();
    const [busynessCFA, setBusynessCFA] = useState(0);
    const [HicksBusyness, setHicksBusyness] = useState(0);
    const [MAPBusyness, setMAPBusyness] = useState(0);

    async function BusynessAverage(hall){
        try {
            // Construct the reference to the specific document
            const docRef = doc(db, "busyness", hall); 

            // Fetch the document data
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                // Access the 'busyness' field
                const busynessValue = docSnap.data().busyness;
                return busynessValue;
            } else {
                console.log("No such document!");
                return null;
            }
        } catch (error) {
            console.error("Error fetching document:", error);
            return null;
        }
    }

    useEffect(() => {
        const fetchBusyness = async (location, setter) => {
          try {
            const result = await BusynessAverage(location);
            setter(Math.ceil(result) || 0);
          } catch (error) {
            console.error(`Error fetching busyness for ${location}:`, error);
          }
        };
      
        fetchBusyness("CFA", setBusynessCFA);
        fetchBusyness("Hicks", setHicksBusyness);
        fetchBusyness("MAP", setMAPBusyness);
    }, []);

    const navigate = useNavigate();

    const handleCarouselItemClick = (route, hallName, hallID) => {
        navigate(route , {state:{name: hallName, hallID: hallID}});
    };

    return ( 
        <div>
            <h1 className="topTitle">BiteDash</h1>
            {/* dining hall links **********************/}
            <Carousel style={{ height: '77vh'}}>
                <Carousel.Item style={{ height: '90vh', overflow: 'hidden', cursor: "pointer", }} 
                    onClick={() => handleCarouselItemClick('/SelectedHall', "Hicks Dining Hall", "Hicks")}
                >
                    <div
                        style={{
                            backgroundImage: `url(${hicks})`,
                            filter: "blur(5px)",
                            filter: "brightness(50%) blur(3px)",
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            width: '100%',
                            height: '100%', 
                        }}
                    />
                    {/* <ExampleImage text="first slide" /> */}
                    <Carousel.Caption>
                        <h1>Hicks Dining hall</h1>
                        <h5>Est Busyness: {HicksBusyness} minutes</h5>
                    </Carousel.Caption>
                </Carousel.Item>
                <Carousel.Item style={{ height: '90vh', overflow: 'hidden', cursor: "pointer", }} 
                    onClick={() => handleCarouselItemClick('/SelectedHall', "MAP Dining Hall", "MAP")}
                >
                    <div
                        style={{
                            backgroundImage: `url(${mapinside})`,
                            filter: "blur(5px)",
                            filter: "brightness(50%) blur(3px)",
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            width: '100%',
                            height: '100%',
                        }}
                    />
                    {/* <ExampleImage text="Second slide" /> */}
                    <Carousel.Caption>
                        <h1>MAP Dining Hall</h1>
                        <h5>Est Busyness: {MAPBusyness} minutes</h5>
                    </Carousel.Caption>
                </Carousel.Item>
                <Carousel.Item style={{ height: '90vh', overflow: 'hidden', cursor: "pointer", }}
                    onClick={() => handleCarouselItemClick('/SelectedHall', "Chick-fil-A", "CFA")}
                >
                    <div
                        style={{
                            backgroundImage: `url(${chickfilapic})`,
                            filter: "blur(5px)",
                            filter: "brightness(50%) blur(3px)",
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            width: '100%',
                            height: '100%',
                        }}
                    />
                    {/* <ExampleImage text="Third slide" /> */}
                    <Carousel.Caption>
                        <h1>Chick-fil-A</h1>
                        <h5>
                        Est Busyness: {busynessCFA} minutes
                        </h5>
                    </Carousel.Caption>
                </Carousel.Item>
            </Carousel>
        </div>
    )
};