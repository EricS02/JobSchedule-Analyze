'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function DebugDataDisplay() {
  const [jobData, setJobData] = useState<any>(null);
  const [dbData, setDbData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJobData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/debug/latest-jobs');
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const result = await response.json();
      setJobData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Debug data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkDatabase = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/debug/db-check');
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const result = await response.json();
      setDbData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Database check error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex justify-between">
          <span>Debug Data</span>
          <div className="space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchJobData}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Check User Jobs'}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={checkDatabase}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Check Database'}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="text-red-500 mb-2">Error: {error}</div>
        )}
        
        <Tabs defaultValue="jobs">
          <TabsList>
            <TabsTrigger value="jobs">User Jobs</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
          </TabsList>
          
          <TabsContent value="jobs">
            {jobData ? (
              <div className="space-y-2">
                <div>
                  <strong>Timestamp:</strong> {new Date(jobData.timestamp).toLocaleString()}
                </div>
                <div>
                  <strong>User ID:</strong> {jobData.userId || 'Not available'}
                </div>
                <div>
                  <strong>Total Jobs in DB:</strong> {jobData.totalJobsInDatabase || 0}
                </div>
                <div>
                  <strong>User's Job Count:</strong> {jobData.userJobCount || 0}
                </div>
                {jobData.jobs && jobData.jobs.length > 0 ? (
                  <div>
                    <strong>Latest Jobs:</strong>
                    <ul className="list-disc pl-5 mt-2">
                      {jobData.jobs.map((job: any) => (
                        <li key={job.id} className="mb-1">
                          {job.title} at {job.company} 
                          <span className="text-xs text-gray-500 ml-2">
                            ({new Date(job.createdAt).toLocaleString()})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="text-amber-500">No jobs found for this user</div>
                )}
              </div>
            ) : (
              <div className="text-gray-500">
                Click "Check User Jobs" to see your jobs from the database
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="database">
            {dbData ? (
              <div className="space-y-2">
                <div>
                  <strong>Timestamp:</strong> {new Date(dbData.timestamp).toLocaleString()}
                </div>
                <div>
                  <strong>Database Status:</strong> 
                  <span className={dbData.databaseStatus === 'connected' ? 'text-green-500' : 'text-red-500'}>
                    {dbData.databaseStatus}
                  </span>
                </div>
                <div>
                  <strong>Total Counts:</strong>
                  <ul className="list-disc pl-5 mt-2">
                    <li>Jobs: {dbData.counts?.jobs || 0}</li>
                    <li>Users: {dbData.counts?.users || 0}</li>
                    <li>Companies: {dbData.counts?.companies || 0}</li>
                  </ul>
                </div>
                {dbData.sampleJob ? (
                  <div>
                    <strong>Sample Job:</strong>
                    <div className="pl-5 mt-2">
                      <div>Title: {dbData.sampleJob.title}</div>
                      <div>Company: {dbData.sampleJob.company}</div>
                      <div>Created: {new Date(dbData.sampleJob.createdAt).toLocaleString()}</div>
                      <div>User ID: {dbData.sampleJob.userId}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-amber-500">No jobs found in database</div>
                )}
              </div>
            ) : (
              <div className="text-gray-500">
                Click "Check Database" to see database status and counts
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 