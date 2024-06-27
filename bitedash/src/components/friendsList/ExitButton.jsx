import React from 'react';
import { Button } from 'react-bootstrap';
import { IoCloseOutline } from "react-icons/io5";
import "./friendsStyle.css"

const LeavePageButton = ({ onClick }) => {
  return (
    <Button className='btn-light' id='button' onClick={onClick}>
      <IoCloseOutline id='xButton'/>
    </Button>
  );
};

export default LeavePageButton;