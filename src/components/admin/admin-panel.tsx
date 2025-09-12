
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { app } from "@/lib/firebase";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, LogIn, UserPlus, ShieldCheck } from "lucide-react";
import { states } from "@/lib/india-states-districts";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const loginSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(1, "Password is required."),
});

type LoginValues = z.infer<typeof loginSchema>;

const registrationSchema = z.object({
    name: z.string().min(2, "Name is required."),
    email: z.string().email("Invalid email address."),
    password: z.string().min(6, "Password must be at least 6 characters."),
    state: z.string().min(1, "State is required."),
    district: z.string().min(1, "District is required."),
});

type RegistrationValues = z.infer<typeof registrationSchema>;


export function AdminPanel() {
  const [view, setView] = useState<"login" | "register" | "superadmin">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState("");
  const [districts, setDistricts] = useState<string[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  const db = getFirestore(app);
  const auth = getAuth(app);

  const loginForm = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });
  const registrationForm = useForm<RegistrationValues>({ resolver: zodResolver(registrationSchema) });


 const onLoginSubmit = async (data: LoginValues) => {
    setIsLoading(true);
    setError(null);
    try {
        const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
        const user = userCredential.user;

        // Super Admin Check based on UID
        if (user.uid === process.env.NEXT_PUBLIC_SUPER_ADMIN_UID) {
            sessionStorage.setItem('userRole', 'superadmin');
            sessionStorage.setItem('adminInfo', JSON.stringify({ name: 'Super Admin', district: 'Global', email: user.email }));
            router.push('/admin/dashboard');
            return; 
        }

        const adminDocRef = doc(db, "admins", user.uid);
        const adminDoc = await getDoc(adminDocRef);

        if (adminDoc.exists()) {
            const adminData = adminDoc.data();
            if (adminData.role === 'admin' && adminData.status === 'approved') {
                sessionStorage.setItem('userRole', 'admin');
                sessionStorage.setItem('adminInfo', JSON.stringify({
                    name: adminData.name,
                    district: adminData.district,
                    state: adminData.state,
                    email: adminData.email
                }));
                router.push('/admin/dashboard');
            } else if (adminData.status === 'pending') {
                setError("Your application is still pending approval.");
                await auth.signOut();
            } else if (adminData.status === 'rejected') {
                setError("Your application has been rejected.");
                await auth.signOut();
            } else {
                setError("You do not have the required permissions to log in.");
                await auth.signOut();
            }
        } else {
             setError("No admin account found for this user.");
             await auth.signOut();
        }
    } catch (error: any) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            setError("Invalid email or password.");
        } else {
            setError("An unexpected error occurred during login.");
            console.error(error);
        }
    } finally {
        setIsLoading(false);
    }
};

 const onRegisterSubmit = async (data: RegistrationValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      await setDoc(doc(db, "admins", user.uid), {
        uid: user.uid,
        name: data.name,
        email: data.email,
        state: data.state,
        district: data.district,
        role: "admin",
        status: "pending",
        createdAt: serverTimestamp(),
      });
      
      await auth.signOut();

      toast({
        title: "Application Submitted",
        description: "Your application to become a district admin has been submitted for review.",
      });
      setView('login');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setError("This email is already registered.");
      } else {
        setError("An unexpected error occurred during registration.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStateChange = (stateName: string) => {
    setSelectedState(stateName);
    const stateData = states.find(s => s.state === stateName);
    setDistricts(stateData ? stateData.districts : []);
    registrationForm.setValue("state", stateName);
    registrationForm.setValue("district", "");
  };
  
  return (
    <Card className="w-full max-w-md mx-auto bg-card/50 backdrop-blur-lg border-white/20 shadow-xl overflow-hidden">
        <AnimatePresence mode="wait">
            {view === 'login' && (
                <motion.div key="login" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}>
                    <CardHeader>
                        <CardTitle className="font-headline text-3xl tracking-tight text-center">Admin Panel</CardTitle>
                        <CardDescription className="text-center">Enter your credentials to log in.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                            <div>
                                <Label htmlFor="login-email">Email</Label>
                                <Input id="login-email" type="email" {...loginForm.register("email")} placeholder="admin@example.com" />
                                {loginForm.formState.errors.email && <p className="text-sm font-medium text-destructive">{loginForm.formState.errors.email.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="login-password">Password</Label>
                                <Input id="login-password" type="password" {...loginForm.register("password")} placeholder="********" />
                                {loginForm.formState.errors.password && <p className="text-sm font-medium text-destructive">{loginForm.formState.errors.password.message}</p>}
                            </div>
                            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading && <span className="mr-2 h-4 w-4 animate-spin border-2 border-background border-t-transparent rounded-full"/>}
                                <LogIn className="mr-2 h-5 w-5"/>
                                Login
                            </Button>
                             <Button type="button" variant="outline" className="w-full" onClick={() => { setView('register'); setError(null); }}>
                                <UserPlus className="mr-2 h-5 w-5" />
                                Register as District Admin
                            </Button>
                        </form>
                    </CardContent>
                </motion.div>
            )}
             {view === 'register' && (
                <motion.div key="register" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
                    <CardHeader>
                        <Button variant="ghost" size="sm" className="absolute top-4 left-4" onClick={() => { setView('login'); setError(null); }}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
                        </Button>
                        <CardTitle className="font-headline text-3xl tracking-tight text-center pt-10">Admin Registration</CardTitle>
                        <CardDescription className="text-center">Apply to become a district administrator.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={registrationForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                            <div>
                                <Label htmlFor="reg-name">Full Name</Label>
                                <Input id="reg-name" {...registrationForm.register("name")} placeholder="Your Name" />
                                {registrationForm.formState.errors.name && <p className="text-sm font-medium text-destructive">{registrationForm.formState.errors.name.message}</p>}
                            </div>
                             <div>
                                <Label htmlFor="reg-email">Email</Label>
                                <Input id="reg-email" type="email" {...registrationForm.register("email")} placeholder="your@email.com" />
                                {registrationForm.formState.errors.email && <p className="text-sm font-medium text-destructive">{registrationForm.formState.errors.email.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="reg-password">Password</Label>
                                <Input id="reg-password" type="password" {...registrationForm.register("password")} placeholder="********" />
                                {registrationForm.formState.errors.password && <p className="text-sm font-medium text-destructive">{registrationForm.formState.errors.password.message}</p>}
                            </div>
                             <div>
                                <Label>State</Label>
                                <Select onValueChange={handleStateChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a state" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {states.map(s => <SelectItem key={s.state} value={s.state}>{s.state}</SelectItem>)}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {registrationForm.formState.errors.state && <p className="text-sm font-medium text-destructive">{registrationForm.formState.errors.state.message}</p>}
                            </div>
                             <div>
                                <Label>District</Label>
                                <Select onValueChange={(value) => registrationForm.setValue("district", value)} disabled={!selectedState}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a district" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {registrationForm.formState.errors.district && <p className="text-sm font-medium text-destructive">{registrationForm.formState.errors.district.message}</p>}
                            </div>
                            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading && <span className="mr-2 h-4 w-4 animate-spin border-2 border-background border-t-transparent rounded-full"/>}
                                Submit Application
                            </Button>
                        </form>
                    </CardContent>
                </motion.div>
            )}
        </AnimatePresence>
    </Card>
  );
}
