import ActivitiesContainer from "@/components/activities/ActivitiesContainer";
import React from "react";

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic'

function Activities() {
  return (
    <div className="col-span-3">
      <ActivitiesContainer />
    </div>
  );
}

export default Activities;
