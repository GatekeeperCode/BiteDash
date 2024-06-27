import { Button, Row, Col, Container } from "react-bootstrap";
import "../../components/diningHalls/Hall.css";
import CFAItem from "./CFAItem";
import ChixSandwich from "../../images/CFAPics/ChixSandwich.png";
import SpicyChixSandwich from "../../images/CFAPics/SpicyChixSandwich.png";
import SpicyDelChixSandwich from "../../images/CFAPics/SpicyDelChixSandwich.png";
import DelChixSandwich from "../../images/CFAPics/ChixDelSandwich.png";
import ChixNuggs from "../../images/CFAPics/ChixNuggs.png";
import GrilledChixNuggs from "../../images/CFAPics/GrilledChixNuggs.png";
import CobbSalad from "../../images/CFAPics/CobbSalad.png";
import MarketSalad from "../../images/CFAPics/MarketSalad.png";
import MacAndCheese from "../../images/CFAPics/MacAndCheese.png";
import Cookie from "../../images/CFAPics/Cookie.png";
import MilkShake from "../../images/CFAPics/Milkshake.png";

export default function CFAMenu() {
    return (
        <div style={{paddingBottom: '10rem'}}>

            <Container className="menuSection redOutline">
                <h2 className="menuSectionTitle">Entrées</h2>
                <CFAItem
                    itemName={'Chicken Sandwich'}
                    itemPic={ChixSandwich}
                />                
                <CFAItem
                    itemName={'Deluxe Chicken Sandwich'}
                    itemPic={DelChixSandwich}
                />
                <CFAItem
                    itemName={'Spicy Chicken Sandwich'}
                    itemPic={SpicyChixSandwich}
                />
                <CFAItem
                    itemName={'Spicy Deluxe Chicken Sandwich'}
                    itemPic={SpicyDelChixSandwich}
                />                
                <CFAItem
                    itemName={'Chicken Nuggets'}
                    itemPic={ChixNuggs}
                />
                <CFAItem
                    itemName={'Grilled Chicken Nuggets'}
                    itemPic={GrilledChixNuggs}
                />

                <h2 className="menuSectionTitle">Salads</h2>
                <CFAItem
                    itemName={'Cobb Salad'}
                    itemPic={CobbSalad}
                />
                <CFAItem
                    itemName={'Market Salad'}
                    itemPic={MarketSalad}
                />

                <h2 className="menuSectionTitle">Sides</h2>
                <CFAItem
                    itemName={'Mac & Cheese'}
                    itemPic={MacAndCheese}
                />

                <h2 className="menuSectionTitle">Treats</h2>
                <CFAItem
                    itemName={'Chocolate Chunk Cookie'}
                    itemPic={Cookie}
                />
                <CFAItem
                    itemName={'Milkshakes'}
                    itemPic={MilkShake}
                />
            </Container>
        </div>
    );

}