import { IoIosAdd } from "react-icons/io";
import React from 'react';
import Fab from '@mui/material/Fab';
import './friendsStyle.css'
import Badge from 'react-bootstrap/Badge';




export default function AddFriendButton({ onSelect, totalRequests }) {
    const showBadge = totalRequests > 0;

    return (
        <div>
            <Fab variant="extended" onClick={onSelect}>
                {showBadge && (
                    <Badge className="blue" text="light" style={{ marginRight: '0.5rem'}}>
                        {totalRequests}
                    </Badge>
                )}
                Add Friend <IoIosAdd id="plus" />
            </Fab>
        </div>
    );
}