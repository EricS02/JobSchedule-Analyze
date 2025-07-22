import SubscriptionManager from "@/components/dashboard/SubscriptionManager";

export default function SubscriptionPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Subscription Management</h1>
          <p className="text-muted-foreground">
            Manage your JobSchedule subscription and billing preferences
          </p>
        </div>

        {/* Subscription Manager Component */}
        <SubscriptionManager />
      </div>
    </div>
  );
} 