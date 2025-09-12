
"use client";

import * as React from "react";
import NextImage from "next/image";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { User, Shield, Upload, X, MapPin, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { IssueSubmittedDialog } from "./issue-submitted-dialog";
import { states } from "@/lib/india-states-districts";
import Map from "./map";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

const reportIssueSchema = z.object({
  reportType: z.enum(["profiled", "anonymous"]),
  reporterName: z.string().optional(),
  reporterEmail: z.string().email().optional(),
  state: z.string({ required_error: "Please select a state." }),
  district: z.string({ required_error: "Please select a district." }),
  streetAddress: z.string().min(10, "A detailed street address is required."),
  cityInfo: z.string(),
  title: z.string().min(5, "Title must be at least 5 characters long."),
  description: z.string().min(20, "Description must be at least 20 characters long."),
  images: z.array(z.any()).max(5, "You can upload a maximum of 5 images."),
});

type ReportIssueFormValues = z.infer<typeof reportIssueSchema>;

interface Location {
    lat: number;
    lng: number;
}

export function ReportIssueForm() {
    const { user } = useAuth();
    const [reportType, setReportType] = useState<"profiled" | "anonymous">("anonymous");
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionData, setSubmissionData] = useState<{ issueId: string; issueTitle: string } | null>(null);
    const [location, setLocation] = useState<Location | null>(null);
    const [hasLocationPermission, setHasLocationPermission] = useState(true);
    const [districts, setDistricts] = useState<string[]>([]);
    const router = useRouter();
    
    const { toast } = useToast();

    const form = useForm<ReportIssueFormValues>({
        resolver: zodResolver(reportIssueSchema),
        defaultValues: {
            reportType: "anonymous",
            images: [],
            streetAddress: "",
            cityInfo: "",
        },
    });

     useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    setHasLocationPermission(true);
                    const newLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    setLocation(newLocation);

                    try {
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLocation.lat}&lon=${newLocation.lng}`);
                        const data = await response.json();
                        if (data && data.address) {
                            const { road, neighbourhood, suburb, city_district, city, state, postcode } = data.address;
                            
                            const street = road || neighbourhood || suburb || "N/A";
                            const cityInfo = `${city_district || city || ''}, ${state || ''}, ${postcode || ''}`;

                            form.setValue('streetAddress', street, { shouldValidate: true });
                            form.setValue('cityInfo', cityInfo.trim(), { shouldValidate: true });
                            

                            const foundState = states.find(s => s.state === state);
                            if (foundState) {
                                form.setValue('state', foundState.state, { shouldValidate: true });
                                setDistricts(foundState.districts);
                                const foundDistrict = foundState.districts.find(d => d === (city_district || city || suburb));
                                if (foundDistrict) {
                                    form.setValue('district', foundDistrict, { shouldValidate: true });
                                }
                            }
                        }
                    } catch (error) {
                        console.error("Error fetching address:", error);
                        toast({ variant: 'destructive', title: "Could not fetch address details."});
                    }
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    setHasLocationPermission(false);
                }
            );
        } else {
            setHasLocationPermission(false);
        }
    }, [form, toast]);

    useEffect(() => {
        if (reportType === 'profiled' && user) {
            form.setValue('reporterName', user.displayName || '');
            form.setValue('reporterEmail', user.email || '');
        }
    }, [reportType, user, form]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const currentFiles = [...imageFiles, ...files].slice(0, 5);
            setImageFiles(currentFiles);

            const previews = currentFiles.map(file => URL.createObjectURL(file));
            setImagePreviews(previews);
        }
    };
    
    const uploadToCloudinary = async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
    
        const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
            method: "POST",
            body: formData,
        });
        const data = await res.json();
        return data.secure_url;
    };

    const removeImage = (index: number) => {
        const newImageFiles = imageFiles.filter((_, i) => i !== index);
        setImageFiles(newImageFiles);
        
        const newImagePreviews = newImageFiles.map(file => URL.createObjectURL(file));
        setImagePreviews(newImagePreviews);
    };
    
    const onSubmit = async (data: ReportIssueFormValues) => {
        if (!hasLocationPermission || !location) {
            toast({
                variant: 'destructive',
                title: 'Location Access Required',
                description: 'Please enable location permissions to submit an issue.',
            });
            return;
        }
        setIsSubmitting(true);
        try {
            const imageUrls = await Promise.all(
                imageFiles.map(async (file) => uploadToCloudinary(file))
            );
            
            const fullAddress = `${data.streetAddress}, ${data.cityInfo}`;

            let collectionName = 'anonymousIssues';
            const issueData: any = {
                title: data.title,
                description: data.description,
                address: fullAddress,
                state: data.state,
                district: data.district,
                imageUrls,
                location,
                status: "Pending",
                createdAt: serverTimestamp(),
            };

            if (data.reportType === 'profiled' && user) {
                collectionName = 'profiledIssues';
                issueData.reporterId = user.uid;
                issueData.reporterName = user.displayName;
                issueData.reporterEmail = user.email;
                issueData.avatarUrl = user.photoURL;
            }

            const docRef = await addDoc(collection(db, collectionName), issueData);
            setSubmissionData({ issueId: docRef.id, issueTitle: data.title });

        } catch (error) {
            console.error("Error submitting issue: ", error);
            toast({
                title: "Submission Failed",
                description: "There was an error submitting your issue. Please try again.",
                variant: "destructive",
            });
        } finally {
             setIsSubmitting(false);
        }
    };

    const handleDialogClose = () => {
        form.reset({ reportType: 'anonymous', images: [] });
        setImagePreviews([]);
        setImageFiles([]);
        setSubmissionData(null);
        router.push('/');
    }

    return (
        <>
            <Card className="w-full max-w-4xl mx-auto bg-card/50 backdrop-blur-lg border-white/20 shadow-xl">
                <CardHeader className="text-center">
                    <CardTitle className="font-headline text-3xl tracking-tight">Report a Civic Issue</CardTitle>
                    <CardDescription>Help improve your community by reporting issues.</CardDescription>
                </CardHeader>
                <CardContent>
                    {!hasLocationPermission && (
                         <Alert variant="destructive" className="mb-6">
                            <MapPin className="h-4 w-4" />
                            <AlertTitle>Location Access Denied</AlertTitle>
                            <AlertDescription>
                                Location access is required to report an issue. Please enable it in your browser settings and refresh the page.
                            </AlertDescription>
                        </Alert>
                    )}
                    <div className="relative w-full h-64 mb-6 rounded-lg overflow-hidden border">
                         {location ? (
                            <Map location={location} path={[]} />
                        ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                                {hasLocationPermission ? 'Getting your location...' : 'Location access denied.'}
                            </div>
                        )}
                    </div>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="space-y-4">
                            <Label>How would you like to report?</Label>
                            <div className="grid grid-cols-2 gap-4">
                                <motion.div whileTap={{ scale: 0.98 }}>
                                    <Button type="button" variant={reportType === 'profiled' ? 'default' : 'outline'} className="w-full h-16 flex flex-col gap-1" onClick={() => { setReportType('profiled'); form.setValue('reportType', 'profiled'); }}>
                                        <User />
                                        <span>With Profile</span>
                                    </Button>
                                </motion.div>
                                <motion.div whileTap={{ scale: 0.98 }}>
                                    <Button type="button" variant={reportType === 'anonymous' ? 'default' : 'outline'} className="w-full h-16 flex flex-col gap-1" onClick={() => { setReportType('anonymous'); form.setValue('reportType', 'anonymous'); }}>
                                        <Shield />
                                        <span>Anonymously</span>
                                    </Button>
                                </motion.div>
                            </div>
                        </div>

                        <AnimatePresence>
                            {reportType === 'profiled' && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-6 p-6 border rounded-lg bg-secondary/30"
                                >
                                    <h3 className="text-lg font-semibold text-center">Your Profile</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="reporterName">Full Name</Label>
                                            <Input id="reporterName" {...form.register("reporterName")} readOnly />
                                        </div>
                                        <div>
                                            <Label htmlFor="reporterEmail">Email</Label>
                                            <Input id="reporterEmail" type="email" {...form.register("reporterEmail")} readOnly />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-6">
                             <div>
                                <Label htmlFor="streetAddress">Street Address / Landmark</Label>
                                <Textarea id="streetAddress" {...form.register("streetAddress")} placeholder="e.g., Near City Hall, Main Street" />
                                {form.formState.errors.streetAddress && <p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.streetAddress.message}</p>}
                            </div>

                             <div>
                                <Label htmlFor="cityInfo">City, State, Pincode</Label>
                                <Input id="cityInfo" {...form.register("cityInfo")} readOnly />
                            </div>

                            <div>
                                <Label htmlFor="title">Issue Title</Label>
                                <Input id="title" {...form.register("title")} placeholder="e.g., Large Pothole on Main Street" />
                                {form.formState.errors.title && <p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.title.message}</p>}
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" {...form.register("description")} placeholder="Describe the issue in detail..." rows={5} />
                                {form.formState.errors.description && <p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.description.message}</p>}
                            </div>
                            
                            <div>
                                <Label htmlFor="images">Upload Images (Max 5)</Label>
                                <div className="mt-2 flex items-center justify-center w-full">
                                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/50 hover:bg-secondary/70">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                            <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                                        </div>
                                        <input id="dropzone-file" type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} disabled={imagePreviews.length >= 5}/>
                                    </label>
                                </div>
                                {imagePreviews.length > 0 && (
                                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                        {imagePreviews.map((src, index) => (
                                            <motion.div key={src} className="relative group" layout>
                                                <NextImage src={src} alt={`Preview ${index}`} width={150} height={150} className="rounded-md object-cover w-full aspect-square" />
                                                <Button type="button" size="icon" variant="destructive" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeImage(index)}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                                {form.formState.errors.images && <p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.images.message}</p>}
                            </div>
                        </div>
                        <motion.div whileTap={{ scale: 0.99 }}>
                            <Button type="submit" size="lg" className="w-full font-bold text-lg" disabled={isSubmitting || !hasLocationPermission}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isSubmitting ? "Submitting..." : "Submit Report"}
                            </Button>
                        </motion.div>
                    </form>
                </CardContent>
            </Card>

            <IssueSubmittedDialog
                isOpen={!!submissionData}
                onClose={handleDialogClose}
                issueId={submissionData?.issueId}
                issueTitle={submissionData?.issueTitle}
            />
        </>
    );
}
