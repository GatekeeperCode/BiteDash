import {React, useState} from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Toolbar from 'react-big-calendar/lib/Toolbar';
import MealPopup from '../../components/calendarView/MealPopup';
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";



class CustomToolbar extends Toolbar {

	componentDidMount() {
		const view = this.props.view;
	}

	render() {
		return (
			<div className='rbc-toolbar' style={{marginTop: "1rem"}}>
				<div className="rbc-btn-group">
					<button type="button" onClick={() => this.navigate('PREV')}> <IoIosArrowBack/> </button>
					<button type="button" onClick={() => this.navigate('TODAY')}>Today</button>
					<button type="button" onClick={() => this.navigate('NEXT')}><IoIosArrowForward/></button>
				</div>
				<div className="rbc-toolbar-label">{this.props.label}</div>
				<div className="rbc-btn-group">
					<button type="button" onClick={this.view.bind(null, 'month')}>Month</button>
					<button type="button" onClick={this.view.bind(null, 'week')}>Week</button>
					<button type="button" onClick={this.view.bind(null, 'day')}>Day</button>
					<button type="button" onClick={this.view.bind(null, 'agenda')}>Agenda</button>
				</div>
			</div>
		);
	}
}


export default function MyCalendar({ events, currentUser, updatePage, setUpdatePage }) {
    const localizer = momentLocalizer(moment);
    const [showMealPopup, setShowMealPopup] = useState(false);
    const openMealPopup = () => setShowMealPopup(true);
    const closeMealPopup = () => setShowMealPopup(false);

    //Event that shows in the popup
    const [currEvent, setCurrEvent] = useState({
        start: new Date(),
        end: new Date(),
        title: "Title",
        location: "Location",
        owner: "Owner",
        accepted: [],
        invited: []
    });


    return (
        <>
            <MealPopup 
                show={showMealPopup}
                handleClose={closeMealPopup} 
                event={currEvent} 
                currentUser={currentUser} 
                updatePage={updatePage}
                setUpdatePage={setUpdatePage}
            />
            <Calendar
                localizer={localizer}
                events={events}
                defaultView='week'
                style={{ height: 650, paddingBottom: "7rem"}}
                components={{toolbar: CustomToolbar}}
                onSelectEvent={(event) => {
                    setCurrEvent(event);
                    openMealPopup(currEvent);

                }}
            />
        </>
    );
}