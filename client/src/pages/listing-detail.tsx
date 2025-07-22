import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ApplicationForm from "@/components/application-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import type { Listing } from "@shared/schema";

export default function ListingDetail() {
  const { id } = useParams();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const { data: listing, isLoading, error } = useQuery<Listing>({
    queryKey: ["/api/listings", id],
    enabled: !!id,
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

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="w-full h-80 rounded-2xl mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3 mb-6" />
            </div>
            <div>
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    if (isUnauthorizedError(error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return null;
    }

    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <i className="fas fa-exclamation-triangle text-4xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Error loading listing</h3>
            <p className="text-slate-600">{error.message}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-slate-500 mb-4">
              <i className="fas fa-home text-4xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Listing not found</h3>
            <p className="text-slate-600">The listing you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isOwner = user?.id === listing.ownerId;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          {/* Image Gallery */}
          <div className="relative">
            <img 
              src={listing.images[0] || "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500"} 
              alt={listing.title}
              className="w-full h-80 object-cover"
            />
            <div className="absolute bottom-4 left-4">
              <Badge className="bg-green-500 text-white">
                <i className="fas fa-check-circle mr-1"></i>Verified Owner
              </Badge>
            </div>
          </div>
          
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">{listing.title}</h1>
                <div className="flex items-center text-slate-600 mb-3">
                  <i className="fas fa-map-marker-alt mr-2"></i>
                  <span>{listing.location}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-4xl font-bold text-primary">₹{listing.rent.toLocaleString()}</span>
                <p className="text-slate-600">per month</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Description</h3>
                <p className="text-slate-600 mb-6">{listing.description}</p>
                
                {listing.amenities.length > 0 && (
                  <>
                    <h3 className="text-xl font-semibold text-slate-900 mb-4">Amenities</h3>
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      {listing.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center">
                          <i className="fas fa-check text-primary mr-2"></i>
                          <span className="text-slate-600">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                
                {listing.preferences.length > 0 && (
                  <>
                    <h3 className="text-xl font-semibold text-slate-900 mb-4">Preferences</h3>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {listing.preferences.map((preference, index) => (
                        <Badge key={index} variant="secondary">{preference}</Badge>
                      ))}
                    </div>
                  </>
                )}
              </div>
              
              <div>
                {!isOwner ? (
                  <ApplicationForm listingId={listing.id} />
                ) : (
                  <div className="bg-slate-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Listing</h3>
                    <p className="text-slate-600 mb-4">This is your listing. You can manage applications from your dashboard.</p>
                    <Button className="w-full" onClick={() => window.location.href = '/dashboard'}>
                      Go to Dashboard
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
