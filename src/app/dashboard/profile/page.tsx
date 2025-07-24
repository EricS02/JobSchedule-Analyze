import ProfileContainer from "@/components/profile/ProfileContainer";
import React from "react";

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic'

function Profile() {
  return (
    <div className="col-span-3">
      <ProfileContainer />
    </div>
  );
}

export default Profile;
