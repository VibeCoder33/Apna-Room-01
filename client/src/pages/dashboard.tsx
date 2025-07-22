import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { useEffect } from "react";
import type { Listing, Application } from "@shared/schema";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const { data: userListings, isLoading: listingsLoading } = useQuery<Listing[]>({
    queryKey: ["/api/users", user?.id, "listings"],
    enabled: !!user?.id,
  });

  const { data: sentApplications, isLoading: sentLoading } = useQuery<Application[]>({
    queryKey: ["/api/applications/sent"],
    enabled: !!user?.id,
  });

  const { data: receivedApplications, isLoading: receivedLoading } = useQuery<Application[]>({
    queryKey: ["/api/applications/received"],
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <Skeleton className="w-full h-96" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
          <p className="text-slate-600">Manage your listings, applications, and conversations</p>
        </div>
        
        <Tabs defaultValue="listings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="listings" className="flex items-center gap-2">
              <i className="fas fa-home"></i>
              My Listings ({userListings?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="sent" className="flex items-center gap-2">
              <i className="fas fa-paper-plane"></i>
              Sent Applications ({sentApplications?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="received" className="flex items-center gap-2">
              <i className="fas fa-inbox"></i>
              Received Applications ({receivedApplications?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="chats" className="flex items-center gap-2">
              <i className="fas fa-comments"></i>
              Chats
            </TabsTrigger>
          </TabsList>

          <TabsContent value="listings" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-900">My Listings</h2>
              <Link href="/create-listing">
                <Button>
                  <i className="fas fa-plus mr-2"></i>Add New Listing
                </Button>
              </Link>
            </div>

            {listingsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : userListings && userListings.length > 0 ? (
              <div className="space-y-4">
                {userListings.map((listing) => (
                  <Card key={listing.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex">
                          <img 
                            src={listing.images[0] || "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=120"} 
                            alt={listing.title}
                            className="w-20 h-20 rounded-lg object-cover mr-4"
                          />
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-1">{listing.title}</h3>
                            <p className="text-slate-600 mb-2">{listing.location}</p>
                            <div className="flex items-center space-x-4 text-sm text-slate-500">
                              <span><i className="fas fa-eye mr-1"></i>Views</span>
                              <span><i className="fas fa-paper-plane mr-1"></i>Applications</span>
                              <Badge variant={listing.available ? "default" : "secondary"}>
                                <i className="fas fa-circle mr-1"></i>
                                {listing.available ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-primary">₹{listing.rent.toLocaleString()}</span>
                          <div className="flex space-x-2 mt-2">
                            <Link href={`/listing/${listing.id}`}>
                              <Button variant="outline" size="sm">
                                <i className="fas fa-eye"></i>
                              </Button>
                            </Link>
                            <Button variant="outline" size="sm">
                              <i className="fas fa-edit"></i>
                            </Button>
                            <Button variant="outline" size="sm">
                              <i className="fas fa-trash"></i>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-slate-500 mb-4">
                  <i className="fas fa-home text-4xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No listings yet</h3>
                <p className="text-slate-600 mb-4">Create your first listing to start finding roommates.</p>
                <Link href="/create-listing">
                  <Button>Create First Listing</Button>
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="sent" className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900">Sent Applications</h2>
            
            {sentLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : sentApplications && sentApplications.length > 0 ? (
              <div className="space-y-4">
                {sentApplications.map((application) => (
                  <Card key={application.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 mb-1">Application #{application.id}</h3>
                          <p className="text-slate-600 mb-2">Listing ID: {application.listingId}</p>
                          <p className="text-slate-600 text-sm">{application.message}</p>
                        </div>
                        <Badge 
                          variant={
                            application.status === "ACCEPTED" ? "default" : 
                            application.status === "REJECTED" ? "destructive" : 
                            "secondary"
                          }
                        >
                          {application.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-slate-500 mb-4">
                  <i className="fas fa-paper-plane text-4xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No applications sent</h3>
                <p className="text-slate-600">Start browsing listings to send your first application.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="received" className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900">Received Applications</h2>
            
            {receivedLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : receivedApplications && receivedApplications.length > 0 ? (
              <div className="space-y-4">
                {receivedApplications.map((application) => (
                  <Card key={application.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 mb-1">Application from Seeker #{application.seekerId}</h3>
                          <p className="text-slate-600 mb-2">For Listing: {application.listingId}</p>
                          <p className="text-slate-600 text-sm">{application.message}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={
                              application.status === "ACCEPTED" ? "default" : 
                              application.status === "REJECTED" ? "destructive" : 
                              "secondary"
                            }
                          >
                            {application.status}
                          </Badge>
                          {application.status === "PENDING" && (
                            <div className="flex gap-2">
                              <Button size="sm" variant="default">Accept</Button>
                              <Button size="sm" variant="destructive">Reject</Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-slate-500 mb-4">
                  <i className="fas fa-inbox text-4xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No applications received</h3>
                <p className="text-slate-600">Applications for your listings will appear here.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="chats" className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900">Active Chats</h2>
            
            <div className="text-center py-12">
              <div className="text-slate-500 mb-4">
                <i className="fas fa-comments text-4xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No active chats</h3>
              <p className="text-slate-600">Chats will appear here when applications are accepted.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
