import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import type { Listing } from "@shared/schema";

interface ListingCardProps {
  listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  return (
    <Card className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border">
      <div className="relative">
        <img 
          src={listing.images[0] || "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"} 
          alt={listing.title}
          className="w-full h-48 object-cover rounded-t-xl"
        />
        <div className="absolute top-3 right-3">
          <Badge className="bg-green-500 text-white">
            <i className="fas fa-check-circle mr-1"></i>Verified
          </Badge>
        </div>
        {listing.roomType && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-accent text-white">{listing.roomType}</Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-slate-900">{listing.title}</h3>
          <span className="text-2xl font-bold text-primary">₹{listing.rent.toLocaleString()}</span>
        </div>
        
        <div className="flex items-center text-slate-600 mb-3">
          <i className="fas fa-map-marker-alt mr-2"></i>
          <span>{listing.location}</span>
        </div>
        
        <p className="text-slate-600 text-sm mb-4 line-clamp-2">
          {listing.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-slate-300 mr-2"></div>
            <span className="text-sm text-slate-600">Owner</span>
            <i className="fas fa-star text-accent ml-2 mr-1"></i>
            <span className="text-sm text-slate-600">4.8</span>
          </div>
          <Link href={`/listing/${listing.id}`}>
            <Button className="bg-primary text-white hover:bg-blue-700 transition-colors">
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
