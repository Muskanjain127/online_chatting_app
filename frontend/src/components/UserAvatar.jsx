import React, { useState } from 'react';

const UserAvatar = ({ user }) => {
    const [failedSource, setFailedSource] = useState(null);
    const photo = user?.profilePhoto;
    const initials = user?.fullName
        ?.trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('') || '?';

    return (
        <div className="profile-photo">
            {photo && failedSource !== photo ? (
                <img
                    src={photo}
                    alt={`${user?.fullName || 'User'} profile`}
                    onError={() => setFailedSource(photo)}
                />
            ) : (
                <span aria-label={`${user?.fullName || 'User'} profile`}>{initials}</span>
            )}
        </div>
    );
};

export default UserAvatar;
