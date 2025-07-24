"use client";
import { Loader, FileText, CheckCircle } from "lucide-react";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import { CreateResumeFormSchema } from "@/models/createResumeForm.schema";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useTransition, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
import { Resume } from "@/models/profile.model";
import { toast } from "../ui/use-toast";
import { extractTextFromPDFClient, isPDFJSSupported } from "@/utils/pdf-client.utils";
import { Progress } from "../ui/progress";

type CreateResumeProps = {
  resumeDialogOpen: boolean;
  setResumeDialogOpen: (e: boolean) => void;
  resumeToEdit?: Resume | null;
  reloadResumes: () => void;
  setNewResumeId: (id: string) => void;
};

function CreateResume({
  resumeDialogOpen,
  setResumeDialogOpen,
  resumeToEdit,
  reloadResumes,
  setNewResumeId,
}: CreateResumeProps) {
  const [isPending, startTransition] = useTransition();
  const [isExtractingPDF, setIsExtractingPDF] = useState(false);
  const [extractedText, setExtractedText] = useState<string>("");
  const [extractionResult, setExtractionResult] = useState<{
    success: boolean;
    pageCount?: number;
    error?: string;
  } | null>(null);

  const pageTitle = resumeToEdit ? "Edit Resume Title" : "Create Resume";

  const form = useForm<z.infer<typeof CreateResumeFormSchema>>({
    resolver: zodResolver(CreateResumeFormSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
    },
  });

  const {
    reset,
    formState: { errors, isValid },
  } = form;

  const closeDialog = () => setResumeDialogOpen(false);

  useEffect(() => {
    reset({
      id: resumeToEdit?.id ?? undefined,
      title: resumeToEdit?.title ?? "",
      fileId: resumeToEdit?.FileId ?? undefined,
    });
  }, [resumeToEdit, reset]);

  const onSubmit = (data: z.infer<typeof CreateResumeFormSchema>) => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("title", data.title);
        
        if (resumeToEdit) {
          formData.append("id", data.id as string);
          if (resumeToEdit.FileId) {
            formData.append("fileId", data.fileId as string);
          }
        }

        // Handle PDF extraction if file is present and is PDF
        if (data.file) {
          // Validate file size (1MB limit)
          const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB
          if (data.file.size > MAX_FILE_SIZE) {
            toast({
              variant: "destructive",
              title: "File Too Large",
              description: "File size must be less than 1MB. Please choose a smaller file.",
            });
            return;
          }
          
          formData.append("file", data.file as File);
          
          const isPDF = data.file.name.toLowerCase().endsWith('.pdf');
          if (isPDF && isPDFJSSupported()) {
            // Debug: Log file type, size, and hex dump
            console.log('PDF file type:', data.file.type);
            console.log('PDF file size:', data.file.size);
            const arrayBuffer = await data.file.arrayBuffer();
            const bytes = new Uint8Array(arrayBuffer.slice(0, 32));
            const hexDump = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(' ');
            console.log('PDF file first 32 bytes (hex):', hexDump);

            console.log('🔍 Starting client-side PDF extraction...');
            setIsExtractingPDF(true);
            setExtractionResult(null);
            
            try {
              const result = await extractTextFromPDFClient(data.file);
              
              if (result.success && result.text.trim().length > 50) {
                console.log('✅ PDF extraction successful!');
                setExtractedText(result.text);
                setExtractionResult({
                  success: true,
                  pageCount: result.pageCount,
                });
                
                // Add extracted text to form data for server processing
                formData.append("extractedText", result.text);
                formData.append("extractionMetadata", JSON.stringify({
                  pageCount: result.pageCount,
                  extractionMethod: result.metadata?.extractionMethod || "client-side-pdfjs-no-worker",
                  success: true,
                  workerDisabled: true,
                  usedOcr: result.metadata?.usedOcr || false
                }));

                // Show appropriate toast message based on extraction method
                const isOcrUsed = result.metadata?.usedOcr || result.metadata?.ocr;
                const toastTitle = isOcrUsed ? "PDF Text Extracted (OCR)" : "PDF Text Extracted!";
                const toastDescription = isOcrUsed 
                  ? `Successfully extracted text using OCR from ${result.pageCount} pages. This will be used to auto-populate your resume sections.`
                  : `Successfully extracted text from ${result.pageCount} pages. This will be used to auto-populate your resume sections.`;

                toast({
                  variant: "success",
                  title: toastTitle,
                  description: toastDescription,
                });
              } else {
                // Extraction failed or no usable text
                console.log('⚠️ PDF extraction returned no usable text or failed:', result.error);
                setExtractionResult({
                  success: false,
                  error: result.error || "No readable text found in PDF",
                });
                
                const userMessage = result.metadata?.userMessage || result.error || "No readable text found in PDF. Please try another file or check the file format.";
                toast({
                  variant: "destructive",
                  title: "PDF Extraction Failed",
                  description: userMessage,
                });
                setIsExtractingPDF(false);
                return; // Do not submit the form
              }
            } catch (extractionError) {
              console.error('❌ PDF extraction failed:', extractionError);
              setExtractionResult({
                success: false,
                error: extractionError instanceof Error ? extractionError.message : "Extraction failed"
              });
              toast({
                variant: "destructive",
                title: "PDF Extraction Failed",
                description: extractionError instanceof Error ? extractionError.message : "Text extraction failed. Please try another file.",
              });
              setIsExtractingPDF(false);
              return; // Do not submit the form
            } finally {
              setIsExtractingPDF(false);
            }
          }
        }

        // Submit the form
        const res = await fetch("/api/profile/resume", {
          method: "POST",
          body: formData,
        });
        
        const response = await res.json();
        
        if (!response.success) {
          toast({
            variant: "destructive",
            title: "Error!",
            description: response?.message,
          });
        } else {
          reset();
          setResumeDialogOpen(false);
          reloadResumes();
          
          if (response.data?.id) {
            setNewResumeId(response.data?.id);
          }
          
          const hasExtractedText = extractedText.length > 0;
          toast({
            variant: "success",
            description: `Resume ${resumeToEdit ? "updated" : "created"} successfully${
              hasExtractedText ? " with extracted content!" : ""
            }`,
          });
          
          // Reset extraction state
          setExtractedText("");
          setExtractionResult(null);
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
    <Dialog open={resumeDialogOpen} onOpenChange={setResumeDialogOpen}>
      <DialogContent className="lg:max-h-screen overflow-y-scroll dark:bg-black dark:text-white">
        <DialogHeader>
          <DialogTitle>{pageTitle}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={(event) => {
              event.stopPropagation();
              form.handleSubmit(onSubmit)(event);
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2"
          >
            {/* RESUME TITLE */}
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resume Title</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Ex: Full Stack Developer Angular, Java"
                      />
                    </FormControl>
                    <FormMessage>
                      {errors.title && (
                        <span className="text-red-500">
                          {errors.title.message}
                        </span>
                      )}
                    </FormMessage>
                  </FormItem>
                )}
              />
            </div>

            {/* RESUME FILE */}
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="file"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Upload Resume (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          field.onChange(e.target.files?.[0] || null);
                        }}
                      />
                    </FormControl>
                    <div className="text-xs text-muted-foreground mt-1">
                      Maximum file size: 1MB
                    </div>
                    {isPDFJSSupported() ? (
                      <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-md p-3 mt-2 dark:bg-green-900 dark:text-green-200 dark:border-green-700">
                        <p className="font-medium flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          PDF text extraction is enabled!
                        </p>
                        <p>Upload a PDF resume and we'll automatically extract the text to help populate your resume sections.</p>
                      </div>
                    ) : (
                      <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md p-3 mt-2 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700">
                        <p className="font-medium">📄 Note about PDF uploads:</p>
                        <p>PDF text extraction is not supported in your browser. Your PDF will be uploaded successfully, but you'll need to manually enter your information.</p>
                      </div>
                    )}
                    
                    {/* PDF Extraction Status */}
                    {isExtractingPDF && (
                      <div className="text-sm bg-blue-50 border border-blue-200 rounded-md p-3 mt-2 dark:bg-gray-900 dark:border-gray-700 dark:text-white">
                        <div className="flex items-center gap-2 mb-2">
                          <Loader className="h-4 w-4 animate-spin" />
                          <p className="font-medium">Extracting text from PDF...</p>
                        </div>
                        <Progress value={undefined} className="h-2 dark:bg-gray-800 dark:border dark:border-gray-700" />
                      </div>
                    )}
                    
                    {extractionResult && (
                      <div className={`text-sm rounded-md p-3 mt-2 ${
                        extractionResult.success 
                          ? 'bg-green-50 border border-green-200 text-green-700 dark:bg-green-900 dark:border-green-700 dark:text-green-200'
                          : 'bg-yellow-50 border border-yellow-200 text-yellow-700 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-200'
                      }`}>
                        {extractionResult.success ? (
                          <div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4" />
                              <p className="font-medium">
                                Text extracted successfully from {extractionResult.pageCount} pages!
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className="font-medium">⚠️ Text extraction failed</p>
                            <p className="text-xs mt-1">{extractionResult.error}</p>
                          </div>
                        )}
                      </div>
                    )}
                    <FormMessage>
                      {errors.file?.message && (
                        <span className="text-red-500">
                          {errors.file.message}
                        </span>
                      )}
                    </FormMessage>
                  </FormItem>
                )}
              />
            </div>

            <div className="md:col-span-2 mt-4">
              <DialogFooter>
                <div>
                  <Button
                    type="reset"
                    variant="outline"
                    className="mt-2 md:mt-0 w-full"
                    onClick={closeDialog}
                  >
                    Cancel
                  </Button>
                </div>
                <Button type="submit" disabled={!isValid || isPending || isExtractingPDF}>
                  {isExtractingPDF ? (
                    <>
                      <Loader className="h-4 w-4 shrink-0 animate-spin mr-2" />
                      Extracting PDF...
                    </>
                  ) : isPending ? (
                    <>
                      <Loader className="h-4 w-4 shrink-0 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
              </DialogFooter>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateResume;
