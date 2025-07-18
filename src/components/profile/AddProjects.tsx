"use client";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AddProjectsFormSchema } from "@/models/addProjectsForm.schema";
import { z } from "zod";
import { useTransition } from "react";
import { toast } from "../ui/use-toast";
import { addProjects } from "@/actions/profile.actions";
import { Loader } from "lucide-react";

interface AddProjectsProps {
  resumeId: string;
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  projectsToEdit?: any;
}

function AddProjects({
  resumeId,
  dialogOpen,
  setDialogOpen,
  projectsToEdit,
}: AddProjectsProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof AddProjectsFormSchema>>({
    resolver: zodResolver(AddProjectsFormSchema),
    defaultValues: {
      resumeId: resumeId,
      sectionTitle: "Projects",
      sectionType: "project",
      title: projectsToEdit?.title || "",
      content: projectsToEdit?.content || "",
      url: projectsToEdit?.url || "",
    },
  });

  const onSubmit = (data: z.infer<typeof AddProjectsFormSchema>) => {
    startTransition(async () => {
      try {
        const response = await addProjects(data);
        
        if (!response.success) {
          toast({
            variant: "destructive",
            title: "Error!",
            description: response?.message,
          });
        } else {
          toast({
            variant: "success",
            description: "Project added successfully!",
          });
          form.reset();
          setDialogOpen(false);
        }
      } catch (error) {
        console.error("Form submission error:", error);
        toast({
          variant: "destructive",
          title: "Error!",
          description: "An unexpected error occurred. Please try again.",
        });
      }
    });
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="lg:max-h-screen overflow-y-scroll dark:bg-black dark:text-white max-w-[95vw] sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {projectsToEdit ? "Edit Project" : "Add Project"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={(event) => {
              event.stopPropagation();
              form.handleSubmit(onSubmit)(event);
            }}
            className="grid grid-cols-1 gap-4 p-2"
          >
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">Project Title</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., E-commerce Website, Mobile App"
                        className="text-sm sm:text-base"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">Project Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe your project, technologies used, and your role..."
                        className="min-h-[120px] text-sm sm:text-base"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">Project URL (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="https://github.com/username/project or https://project-demo.com"
                        className="text-sm sm:text-base"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="mt-4">
              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
                  {isPending ? (
                    <>
                      <Loader className="h-4 w-4 shrink-0 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default AddProjects; 