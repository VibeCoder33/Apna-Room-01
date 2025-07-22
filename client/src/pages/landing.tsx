import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/header";
import Footer from "@/components/footer";
import SearchForm from "@/components/search-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const hasShownWelcome = localStorage.getItem('hasShownWelcome');
      if (!hasShownWelcome) {
        toast({
          title: "Welcome to ApnaRoom!",
          description: "Sign in to start finding your perfect roommate.",
        });
        localStorage.setItem('hasShownWelcome', 'true');
      }
    }
  }, [isAuthenticated, isLoading, toast]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary to-secondary text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-secondary/90" style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find Your Perfect <span className="text-accent">Roommate</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Connect with verified flat listers and seekers. Safe, secure, and completely free.
            </p>
            
            <SearchForm />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Choose ApnaRoom?</h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              We're revolutionizing the roommate finding experience with trust, safety, and convenience at our core.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-shield-alt text-2xl text-primary"></i>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">100% Verified Users</h3>
              <p className="text-slate-600">Every user is verified with ID proof and selfie verification. No fake profiles, no scams.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-secondary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-comments text-2xl text-secondary"></i>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Direct Communication</h3>
              <p className="text-slate-600">Chat directly with property owners and seekers. No middlemen, no extra charges.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-heart text-2xl text-accent"></i>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">AI-Powered Matching</h3>
              <p className="text-slate-600">Our intelligent system matches you with the most compatible roommates based on preferences.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">What Our Users Say</h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Real reviews from verified users who found their perfect roommates through ApnaRoom.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex text-accent">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className="fas fa-star"></i>
                    ))}
                  </div>
                  <span className="ml-2 text-slate-600 text-sm">5.0</span>
                </div>
                <p className="text-slate-700 mb-4">
                  "Found my perfect roommate within a week! The verification process made me feel safe, and the chat feature made communication so easy."
                </p>
                <div className="flex items-center">
                  <img 
                    src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100" 
                    alt="Reviewer" 
                    className="w-10 h-10 rounded-full object-cover mr-3"
                  />
                  <div>
                    <h4 className="font-semibold text-slate-900">Sneha Patel</h4>
                    <p className="text-slate-600 text-sm">Mumbai</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex text-accent">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className="fas fa-star"></i>
                    ))}
                  </div>
                  <span className="ml-2 text-slate-600 text-sm">5.0</span>
                </div>
                <p className="text-slate-700 mb-4">
                  "ApnaRoom is a game-changer! No more shady WhatsApp groups. Everything is transparent and secure here."
                </p>
                <div className="flex items-center">
                  <img 
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100" 
                    alt="Reviewer" 
                    className="w-10 h-10 rounded-full object-cover mr-3"
                  />
                  <div>
                    <h4 className="font-semibold text-slate-900">Arjun Singh</h4>
                    <p className="text-slate-600 text-sm">Delhi</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex text-accent">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className="fas fa-star"></i>
                    ))}
                  </div>
                  <span className="ml-2 text-slate-600 text-sm">5.0</span>
                </div>
                <p className="text-slate-700 mb-4">
                  "Love the AI matching feature! It connected me with a roommate who shares similar interests and lifestyle. Highly recommended!"
                </p>
                <div className="flex items-center">
                  <img 
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100" 
                    alt="Reviewer" 
                    className="w-10 h-10 rounded-full object-cover mr-3"
                  />
                  <div>
                    <h4 className="font-semibold text-slate-900">Kavya Reddy</h4>
                    <p className="text-slate-600 text-sm">Bangalore</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
