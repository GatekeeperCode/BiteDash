import { FaRegBell } from 'react-icons/fa';
import Button from 'react-bootstrap/Button';
import { Badge } from "@mui/material";
import "./friendsStyle.css"

export default function InvitesButton({ onSelect, value }) {
    return (
        <>
            <Button 
                id='invite-button' 
                variant='' 
                size='md' 
                active
                onClick={onSelect}
                style={{height: "4.3rem", marginTop: ".3rem"}}
            >
                <Badge badgeContent={value}>
                <FaRegBell className='bell' style={{height: "1.5em", width: "1.5em"}}/>
                </Badge> <br />
                Invites
            </Button>
        </>
    );
}