// client/src/App.tsx
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import ListingDetail from "@/pages/listing-detail";
import Dashboard from "@/pages/dashboard";
import CreateListing from "@/pages/create-listing";
import {
  SignIn,
  SignUp,
  SignedIn,
  SignedOut,
  RedirectToSignIn,
} from "@clerk/clerk-react";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Auth routes */}
      <Route
        path="/sign-in"
        component={() => <SignIn routing="path" path="/sign-in" />}
      />
      <Route
        path="/sign-up"
        component={() => <SignUp routing="path" path="/sign-up" />}
      />

      {/* Protected routes */}
      <Route path="/dashboard">
        <SignedIn>
          <Dashboard />
        </SignedIn>
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
      </Route>

      <Route path="/create-listing">
        <SignedIn>
          <CreateListing />
        </SignedIn>
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
      </Route>

      <Route path="/listing/:id">
        <SignedIn>
          <ListingDetail />
        </SignedIn>
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
      </Route>

      {/* Home route */}
      <Route path="/">
        {isLoading ? null : isAuthenticated ? <Home /> : <Landing />}
      </Route>

      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
