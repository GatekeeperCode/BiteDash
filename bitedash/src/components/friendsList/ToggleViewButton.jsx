import { useState } from 'react';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';
import { FaCalendarAlt } from 'react-icons/fa'; 
import { CiCircleList } from 'react-icons/ci';
import './friendsStyle.css';

export default function ToggleViewButton({ setViewType, viewType }) {
    const [radioValue, setRadioValue] = useState(Number(!viewType));

    function handleChange(e) {
        setRadioValue(Number(e.currentTarget.value));
        setViewType(!viewType);
    }

    const radios = [
        { name: 'Friends', value: 0, icon: CiCircleList },
        { name: 'Bites', value: 1, icon: FaCalendarAlt }
    ];

    return (
        <ButtonGroup className='mb-2'>
            {radios.map((radio, index) => (
                <ToggleButton
                    id={`radio-${index}`}
                    key={index}
                    type='radio'
                    variant='light'
                    value={radio.value}
                    checked={radioValue === radio.value}
                    onChange={(e) => handleChange(e)}
                    style = {{width: '80px'}}
                >
                    {<radio.icon className='icon'/>}
                    <br />
                    {radio.name}
                </ToggleButton>
            ))}
        </ButtonGroup>
    );
}