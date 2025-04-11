import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { EmergencyButtonProps } from "@/types";
import { getCurrentLocation } from "@/lib/location";
import { useToast } from "@/hooks/use-toast";

export const EmergencyButton: React.FC<EmergencyButtonProps> = ({ onRequest, isLoading = false }) => {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleEmergencyRequest = async () => {
    setIsProcessing(true);
    try {
      const coordinates = await getCurrentLocation();
      onRequest(coordinates, description);
      toast({
        title: "Emergency request sent",
        description: "Help is on the way. Stay calm and wait for assistance.",
        variant: "default",
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: "Location error",
        description: "Could not get your location. Please enable location services.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Button 
        variant="destructive" 
        size="lg" 
        className="w-full py-6 text-lg font-bold flex items-center justify-center"
        onClick={() => setOpen(true)}
        disabled={isLoading}
      >
        {isLoading ? (
          <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>
        ) : (
          <i className="fa-solid fa-phone-alt mr-2"></i>
        )}
        Request Emergency Help
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Request Emergency Assistance</AlertDialogTitle>
            <AlertDialogDescription>
              This will share your current location with emergency responders.
              Please provide any additional information about your emergency situation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <Textarea
            placeholder="Describe your emergency situation (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-2"
            rows={4}
          />
          
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEmergencyRequest}
              disabled={isProcessing}
              className="bg-red-500 hover:bg-red-600"
            >
              {isProcessing ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>
                  Processing...
                </>
              ) : (
                "Confirm Emergency Request"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EmergencyButton;
