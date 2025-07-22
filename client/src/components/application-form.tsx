import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { insertApplicationSchema } from "@shared/schema";
import { z } from "zod";

const formSchema = insertApplicationSchema.extend({
  message: z.string().min(10, "Message must be at least 10 characters long"),
});

type FormData = z.infer<typeof formSchema>;

interface ApplicationFormProps {
  listingId: number;
}

export default function ApplicationForm({ listingId }: ApplicationFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [hasApplied, setHasApplied] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      listingId,
      message: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      return await apiRequest("POST", "/api/applications", data);
    },
    onSuccess: () => {
      toast({
        title: "Application Sent!",
        description: "Your application has been sent to the owner. They will review and respond soon.",
      });
      setHasApplied(true);
      queryClient.invalidateQueries({ queryKey: ["/api/applications/sent"] });
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
        description: "Failed to send application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  if (hasApplied) {
    return (
      <Card className="border-2 border-green-200">
        <CardContent className="p-6 text-center">
          <div className="text-green-500 mb-4">
            <i className="fas fa-check-circle text-4xl"></i>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Application Sent!</h3>
          <p className="text-slate-600 mb-4">
            Your application has been sent to the property owner. They will review and respond soon.
          </p>
          <Button variant="outline" className="w-full">
            View Application Status
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-primary">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900">Apply for this room</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message to Owner</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell the owner about yourself, your profession, lifestyle, and why you'd be a good roommate..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full bg-primary text-white hover:bg-blue-700 transition-colors"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Sending...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane mr-2"></i>
                  Send Application
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
