import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ListingCard from "./listing-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Listing } from "@shared/schema";

export default function SearchForm() {
  const [filters, setFilters] = useState({
    search: "",
    minRent: "",
    maxRent: "",
    roomType: "",
  });
  const [isSearching, setIsSearching] = useState(false);

  const { data: listings, isLoading } = useQuery<Listing[]>({
    queryKey: ["/api/listings", filters],
    enabled: isSearching,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getRentRange = (range: string) => {
    switch (range) {
      case "5000-10000": return { min: 5000, max: 10000 };
      case "10000-20000": return { min: 10000, max: 20000 };
      case "20000-30000": return { min: 20000, max: 30000 };
      case "30000+": return { min: 30000, max: undefined };
      default: return { min: undefined, max: undefined };
    }
  };

  return (
    <div className="w-full">
      {/* Search Bar */}
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-4xl mx-auto mb-8">
        <form onSubmit={handleSearch}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
              <div className="relative">
                <i className="fas fa-map-marker-alt absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
                <Input 
                  type="text" 
                  placeholder="Enter city or area" 
                  className="pl-10"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Budget Range</label>
              <Select onValueChange={(value) => {
                const { min, max } = getRentRange(value);
                setFilters(prev => ({ 
                  ...prev, 
                  minRent: min?.toString() || "", 
                  maxRent: max?.toString() || "" 
                }));
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Any Budget" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Budget</SelectItem>
                  <SelectItem value="5000-10000">₹5,000 - ₹10,000</SelectItem>
                  <SelectItem value="10000-20000">₹10,000 - ₹20,000</SelectItem>
                  <SelectItem value="20000-30000">₹20,000 - ₹30,000</SelectItem>
                  <SelectItem value="30000+">₹30,000+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Room Type</label>
              <Select onValueChange={(value) => handleFilterChange("roomType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Any Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Type</SelectItem>
                  <SelectItem value="Single Room">Single Room</SelectItem>
                  <SelectItem value="Shared Room">Shared Room</SelectItem>
                  <SelectItem value="1BHK">1BHK</SelectItem>
                  <SelectItem value="2BHK">2BHK</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button type="submit" className="w-full bg-primary text-white hover:bg-blue-700 transition-colors">
                <i className="fas fa-search mr-2"></i>
                Search
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Search Results */}
      {isSearching && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-bold text-white mb-6">Search Results</h3>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border p-6">
                  <Skeleton className="w-full h-48 rounded-t-xl mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                </div>
              ))}
            </div>
          ) : listings && listings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-blue-100 mb-4">
                <i className="fas fa-search text-4xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No results found</h3>
              <p className="text-blue-100">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
