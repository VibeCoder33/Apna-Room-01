import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ImageUpload from "@/components/image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { insertListingSchema } from "@shared/schema";
import { z } from "zod";

const formSchema = insertListingSchema.extend({
  amenities: z.array(z.string()).default([]),
  preferences: z.array(z.string()).default([]),
});

type FormData = z.infer<typeof formSchema>;

const AMENITIES_OPTIONS = [
  "High-Speed WiFi", "Air Conditioning", "Parking Available", "24/7 Security",
  "Gym Access", "Kitchen Access", "Laundry", "Swimming Pool", "Balcony", "Furnished"
];

const PREFERENCES_OPTIONS = [
  "Working Professional", "Student", "Non-Smoker", "Vegetarian",
  "Male Preferred", "Female Preferred", "Age 18-25", "Age 25-35", "Pet Friendly"
];

export default function CreateListing() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      rent: 0,
      currency: "INR",
      location: "",
      roomType: "",
      available: true,
      images: [],
      amenities: [],
      preferences: [],
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      return await apiRequest("POST", "/api/listings", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Listing created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
      setLocation("/dashboard");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to create listing. Please try again.",
        variant: "destructive",
      });
    },
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

  const onSubmit = (data: FormData) => {
    const listingData = {
      ...data,
      images,
      amenities: selectedAmenities,
      preferences: selectedPreferences,
    };
    mutation.mutate(listingData);
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const togglePreference = (preference: string) => {
    setSelectedPreferences(prev => 
      prev.includes(preference) 
        ? prev.filter(p => p !== preference)
        : [...prev, preference]
    );
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-sm border p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-slate-200 rounded w-1/3 mb-6"></div>
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-12 bg-slate-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-slate-900">Create New Listing</CardTitle>
            <p className="text-slate-600">Fill in the details to create your room listing</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Spacious Room in Koramangala" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Rent (₹)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="15000" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Koramangala, Bangalore" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="roomType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Room Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select room type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Single Room">Single Room</SelectItem>
                            <SelectItem value="Shared Room">Shared Room</SelectItem>
                            <SelectItem value="1BHK">1BHK</SelectItem>
                            <SelectItem value="2BHK">2BHK</SelectItem>
                            <SelectItem value="3BHK">3BHK</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your room, nearby amenities, and what makes it special..."
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Images</label>
                  <ImageUpload images={images} onImagesChange={setImages} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Amenities</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {AMENITIES_OPTIONS.map((amenity) => (
                      <button
                        key={amenity}
                        type="button"
                        onClick={() => toggleAmenity(amenity)}
                        className={`p-2 text-sm rounded-lg border transition-colors ${
                          selectedAmenities.includes(amenity)
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-slate-600 border-slate-300 hover:border-primary'
                        }`}
                      >
                        {amenity}
                      </button>
                    ))}
                  </div>
                  {selectedAmenities.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedAmenities.map((amenity) => (
                        <Badge key={amenity} variant="default">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Roommate Preferences</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {PREFERENCES_OPTIONS.map((preference) => (
                      <button
                        key={preference}
                        type="button"
                        onClick={() => togglePreference(preference)}
                        className={`p-2 text-sm rounded-lg border transition-colors ${
                          selectedPreferences.includes(preference)
                            ? 'bg-secondary text-white border-secondary'
                            : 'bg-white text-slate-600 border-slate-300 hover:border-secondary'
                        }`}
                      >
                        {preference}
                      </button>
                    ))}
                  </div>
                  {selectedPreferences.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedPreferences.map((preference) => (
                        <Badge key={preference} variant="secondary">
                          {preference}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-6">
                  <Button 
                    type="submit" 
                    className="flex-1"
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Creating...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-plus mr-2"></i>
                        Create Listing
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setLocation("/dashboard")}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
