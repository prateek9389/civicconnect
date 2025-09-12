
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
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
      message: "Password must be at least 6 characters."
  })
});

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({
        title: "Logged In Successfully!",
        description: "Welcome back.",
      });
      router.push("/");
    } catch (error: any) {
        toast({
            title: "Login Failed",
            description: "Invalid email or password. Please try again.",
            variant: "destructive"
        });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 pt-20 pb-24 md:pb-0 flex items-center justify-center">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
             <Card>
                 <CardHeader className="text-center">
                    <CardTitle className="font-headline text-4xl font-bold tracking-tight text-foreground md:text-5xl">Welcome Back</CardTitle>
                    <CardDescription className="mt-4 text-lg text-muted-foreground">Log in to continue to CivicConnect.</CardDescription>
                 </CardHeader>
                 <CardContent>
                    <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                            Log In
                        </Button>
                    </form>
                    </Form>
                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        Don't have an account?{" "}
                        <Link href="/signup" className="font-semibold text-primary hover:underline">
                            Sign Up
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
