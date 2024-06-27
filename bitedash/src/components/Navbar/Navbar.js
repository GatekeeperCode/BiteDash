import React, { useState, useEffect, Fragment} from 'react';
import { Nav, NavLink, NavMenu } from "./NavbarElements";
import { HiOutlineUsers } from "react-icons/hi2";
import "./navbarStyle.css"
import { LuUtensils } from "react-icons/lu";
import { IoSettingsOutline } from "react-icons/io5";
import { Badge } from "@mui/material";
import { useMsal } from '@azure/msal-react';
import { firestore } from "../../firebase";
import { collection, query, where, getDocs} from "@firebase/firestore";
import { useLocation } from 'react-router-dom';




const NavBar = () => {
    const location = useLocation();
    const isFriendsPage = location.pathname.includes('/friends');
    const { accounts } = useMsal();
    const currentUser = accounts[0];
    const [totalInvites, setTotalInvites] = useState(0);
    const [totalFriendRequests, setTotalFriendRequests] = useState(0); // State for friend requests

    useEffect(() => {
        const fetchData = async () => {
            try {
                const currentUserQuery = query(
                    collection(firestore, 'users'), // Replace 'firestore' with your actual Firestore instance
                    where('email', '==', currentUser.username)
                );
                const currentUserSnapshot = await getDocs(currentUserQuery);
                const friendRequests = currentUserSnapshot.docs[0].data().incomingRequests;
                setTotalFriendRequests(friendRequests.length);
            } catch (err) {
                console.log(err);
            }
        };
        const fetchInvites = async () => {
            const bitesCollection = collection(firestore, "bite");
            const querySnapshot = await getDocs(bitesCollection);
        
            const bites = [];
        
            querySnapshot.forEach((doc) => {
                const invitedUsers = doc.data().invited;
        
                if (invitedUsers.includes(currentUser.name)) {
                    bites.push({ id: doc.id, ...doc.data() });
                }
            });
            setTotalInvites(bites.length)
        }
        fetchInvites();
        fetchData();
    }, [isFriendsPage]);


    

 return (
   <>
   <Nav className="justify-content-center">
       <NavMenu>
       <div className="text-center" id="background">
           <NavLink to="/friends" activeStyle={{ background: "#716588 !important" }}>
           {(isFriendsPage) ? (
            <Badge badgeContent={0} color="primary">
            <div className="row">
                <div className="col-auto">
                    <HiOutlineUsers className="navIcon"/>
                    <h6 style={{color: 'white'}}>Social</h6>
                </div>
            </div>
            </Badge>
           ) : 
           <Badge badgeContent={totalInvites + totalFriendRequests}>
            <div className="row">
                <div className="col-auto">
                    <HiOutlineUsers className="navIcon"/>
                    <h6 style={{color: 'white'}}>Social</h6>
                </div>
            </div>
            </Badge>
            }
           </NavLink>
           </div>
           <div className="text-center"  id="background">
           <NavLink to="/" activeStyle={{ background: "#716588 !important"  }}>
                <div className="row">
                    <div className="col-auto">
                        <LuUtensils className="navIcon"/>
                        <h6 style={{color: 'white'}}>Home</h6>
                    </div>
                </div>
           </NavLink>
           </div>
           <div className="text-center" id="background">
           <NavLink to="/preferences" activeStyle={{ background: "#716588 !important" }}>
            <div className="row" >
                <div className="col-auto">
                    <IoSettingsOutline className="navIcon"/>
                    <h6 style={{color: 'white'}}> Settings</h6>
                </div>
            </div>
           </NavLink>
           </div>
       </NavMenu>
   </Nav>

</>
 );
};

export default NavBar;