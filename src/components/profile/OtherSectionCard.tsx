"use client";
import { ResumeSection } from "@/models/profile.model";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Edit, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { deleteOtherSection } from "@/actions/profile.actions";
import { toast } from "../ui/use-toast";
import { useTransition } from "react";

interface OtherSectionCardProps {
  section: ResumeSection;
  openDialogForEdit: () => void;
}

function OtherSectionCard({ section, openDialogForEdit }: OtherSectionCardProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!section.others || section.others.length === 0) return;
    
    startTransition(async () => {
      try {
        const response = await deleteOtherSection(section.others?.[0]?.id);
        
        if (!response.success) {
          toast({
            variant: "destructive",
            title: "Error!",
            description: response?.message,
          });
        } else {
          toast({
            variant: "success",
            description: "Section deleted successfully!",
          });
        }
      } catch (error) {
        console.error("Delete error:", error);
        toast({
          variant: "destructive",
          title: "Error!",
          description: "An unexpected error occurred. Please try again.",
        });
      }
    });
  };

  if (!section.others || section.others.length === 0) {
    return null;
  }

  const otherSection = section.others[0];

  return (
    <Card>
      <CardHeader className="flex-row justify-between items-start">
        <CardTitle className="text-lg">{section.sectionTitle}</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={openDialogForEdit}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                disabled={isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Section</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this {section.sectionTitle.toLowerCase()} section? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-base mb-2">{otherSection.title}</h4>
            <div className="text-sm text-muted-foreground whitespace-pre-wrap">
              {otherSection.content}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default OtherSectionCard; 