import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Header() {
  const { user, isAuthenticated, isLoading } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/">
              <h1 className="text-2xl font-bold text-primary cursor-pointer">ApnaRoom</h1>
            </Link>
          </div>
          
          {isAuthenticated && (
            <nav className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <Link href="/">
                  <a className="text-slate-900 hover:text-primary px-3 py-2 text-sm font-medium">Browse Rooms</a>
                </Link>
                <Link href="/create-listing">
                  <a className="text-slate-600 hover:text-primary px-3 py-2 text-sm font-medium">Post Room</a>
                </Link>
                <Link href="/dashboard">
                  <a className="text-slate-600 hover:text-primary px-3 py-2 text-sm font-medium">Dashboard</a>
                </Link>
              </div>
            </nav>
          )}

          <div className="flex items-center space-x-4">
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse"></div>
            ) : isAuthenticated ? (
              <div className="flex items-center space-x-3">
                {user?.profileImageUrl && (
                  <img 
                    src={user.profileImageUrl} 
                    alt={user.firstName || "User"} 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
                <span className="text-sm font-medium text-slate-700">
                  {user?.firstName || "User"}
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.href = "/api/logout"}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button onClick={() => window.location.href = "/api/login"}>
                Sign In
              </Button>
            )}
            
            <button className="md:hidden">
              <i className="fas fa-bars text-slate-600"></i>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
