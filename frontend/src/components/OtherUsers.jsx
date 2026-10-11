import React from 'react'
import OtherUser from './OtherUser';
import useGetOtherUsers from '../hooks/useGetOtherUsers';


const OtherUsers = ({ users }) => {
    useGetOtherUsers();
    if (!users) return;
     
    return (
        <div className='overflow-auto flex-1'>
            {
              Array.isArray(users) &&  users?.map((user)=>{
                    return (
                        <OtherUser key={user._id} user={user}/>
                    )
                })
            }
            
        </div>
    )
}

export default OtherUsers
