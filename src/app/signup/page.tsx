
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Upload } from "lucide-react";
import Image from "next/image";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  profileImage: z.instanceof(File).optional(),
});

export default function SignupPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });
  
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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;
      
      let photoURL: string | null = null;
      if (values.profileImage) {
          const uploadedUrl = await uploadToCloudinary(values.profileImage);
          if (typeof uploadedUrl === 'string') {
            photoURL = uploadedUrl;
          }
      }

      await updateProfile(user, {
          displayName: values.name,
          photoURL: photoURL,
      });
      
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        displayName: values.name,
        email: values.email,
        photoURL: photoURL,
        createdAt: new Date(),
      });
      
      toast({
        title: "Account Created!",
        description: "Welcome to CivicConnect.",
      });

      router.push("/");
    } catch (error: any) {
        toast({
            title: "Sign Up Failed",
            description: error.message,
            variant: "destructive"
        });
    } finally {
        setIsLoading(false);
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      form.setValue("profileImage", file);
      setImagePreview(URL.createObjectURL(file));
    }
  };


  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 pt-20 pb-24 md:pb-0 flex items-center justify-center">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
             <Card>
                 <CardHeader className="text-center">
                    <CardTitle className="font-headline text-4xl font-bold tracking-tight text-foreground md:text-5xl">Create an Account</CardTitle>
                    <CardDescription className="mt-4 text-lg text-muted-foreground">Join the community and start making a difference.</CardDescription>
                 </CardHeader>
                 <CardContent>
                    <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="profileImage"
                            render={({ field }) => (
                                <FormItem className="flex flex-col items-center">
                                    <FormLabel>Profile Picture</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <input type="file" id="profile-image-upload" className="hidden" onChange={handleImageChange} accept="image/*" />
                                            <label htmlFor="profile-image-upload" className="cursor-pointer">
                                                <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center overflow-hidden border">
                                                    {imagePreview ? (
                                                        <Image src={imagePreview} alt="Profile preview" width={128} height={128} className="object-cover h-full w-full" />
                                                    ) : (
                                                        <Upload className="h-12 w-12 text-muted-foreground" />
                                                    )}
                                                </div>
                                            </label>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Your Name" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="your.email@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                         <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="********" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <Button type="submit" className="w-full" disabled={isLoading}>
                             {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                             Sign Up
                        </Button>
                    </form>
                    </Form>
                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/login" className="font-semibold text-primary hover:underline">
                            Log In
                        </Link>
                    </p>
                 </CardContent>
             </Card>
          </div>
        </div>
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
