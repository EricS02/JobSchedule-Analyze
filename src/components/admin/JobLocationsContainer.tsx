"use client";
import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { APP_CONSTANTS } from "@/lib/constants";
import { Location } from "@prisma/client";
import JobLocationsTable from "./JobLocationsTable";
import { getJobLocationsList } from "@/actions/jobLocation.actions";
import { ensureUserJobRelationships } from "@/actions/job.actions";
import Loading from "../Loading";

function JobLocationsContainer() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [totalJobLocations, setTotalJobLocations] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [isFixingRelationships, setIsFixingRelationships] = useState<boolean>(false);

  const recordsPerPage = APP_CONSTANTS.RECORDS_PER_PAGE;

  const loadJobLocations = useCallback(
    async (page: number) => {
      console.log('JobLocationsContainer: Calling getJobLocationsList...');
      setLoading(true);
      const { data, total } = await getJobLocationsList(
        page,
        recordsPerPage,
        "applied"
      );
      console.log('JobLocationsContainer: Received data:', { data, total });
      if (data) {
        setLocations((prev) => (page === 1 ? data : [...prev, ...data]));
        setTotalJobLocations(total);
        setPage(page);
        setLoading(false);
      }
    },
    [recordsPerPage]
  );

  const reloadJobLocations = useCallback(async () => {
    await loadJobLocations(1);
  }, [loadJobLocations]);

  const handleFixJobRelationships = async () => {
    setIsFixingRelationships(true);
    try {
      const result = await ensureUserJobRelationships();
      if (result.success) {
        console.log(`Fixed ${result.fixedCount} job relationships`);
        // Reload the locations after fixing relationships
        await reloadJobLocations();
      } else {
        console.error("Failed to fix job relationships:", result.message);
      }
    } catch (error) {
      console.error("Error fixing job relationships:", error);
    } finally {
      setIsFixingRelationships(false);
    }
  };

  useEffect(() => {
    console.log('JobLocationsContainer: Loading job locations...');
    (async () => {
      // First, try to fix any existing relationship issues
      await handleFixJobRelationships();
      // Then load the locations
      await loadJobLocations(1);
    })();
  }, [loadJobLocations]);

  return (
    <>
      <div className="col-span-3">
        <Card x-chunk="dashboard-06-chunk-0">
          <CardHeader className="flex-row justify-between items-center">
            <CardTitle>Job Locations</CardTitle>
            {isFixingRelationships && (
              <div className="text-sm text-muted-foreground">
                Fixing job relationships...
              </div>
            )}
          </CardHeader>
          <CardContent>
            {(loading || isFixingRelationships) && <Loading />}
            {locations.length > 0 && !loading && !isFixingRelationships && (
              <>
                <JobLocationsTable
                  jobLocations={locations}
                  reloadJobLocations={reloadJobLocations}
                />
                <div className="text-xs text-muted-foreground">
                  Showing{" "}
                  <strong>
                    {1} to {locations.length}
                  </strong>{" "}
                  of
                  <strong> {totalJobLocations}</strong> job locations
                </div>
              </>
            )}
            {locations.length < totalJobLocations && !loading && !isFixingRelationships && (
              <div className="flex justify-center p-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => loadJobLocations(page + 1)}
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
            {locations.length === 0 && !loading && !isFixingRelationships && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No job locations found.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Add some jobs to see locations here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default JobLocationsContainer;
