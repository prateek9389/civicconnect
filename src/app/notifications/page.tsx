
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs, Timestamp } from "firebase/firestore";
import { Loader2, BellRing } from "lucide-react";

interface Notification {
  id: string;
  issueId: string;
  message: string;
  createdAt: Timestamp;
  read: boolean;
  type: "vote" | "status_update";
}

function NotificationsContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (user) {
        setIsLoadingNotifications(true);
        try {
          const q = query(
            collection(db, "users", user.uid, "notifications"),
            orderBy("createdAt", "desc")
          );
          const querySnapshot = await getDocs(q);
          const fetchedNotifications = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          } as Notification));
          setNotifications(fetchedNotifications);
        } catch (error) {
          console.error("Error fetching notifications:", error);
        } finally {
          setIsLoadingNotifications(false);
        }
      }
    };
    fetchNotifications();
  }, [user]);

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const timeAgo = (timestamp: Timestamp) => {
    const now = new Date();
    const notificationDate = timestamp.toDate();
    const seconds = Math.floor((now.getTime() - notificationDate.getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
  };


  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 pt-20 pb-24 md:pb-0">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>My Notifications</CardTitle>
              <CardDescription>
                Updates on your reported issues and community activity.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingNotifications ? (
                <div className="flex justify-center items-center h-48">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : notifications.length > 0 ? (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                     <Link href={`/issue/${notification.issueId}`} key={notification.id} className="block hover:bg-secondary/50 rounded-lg transition-colors">
                      <div
                        className={`flex items-start gap-4 p-4 border rounded-lg ${
                          !notification.read ? "bg-secondary/50" : "bg-transparent"
                        }`}
                      >
                        <div className="mt-1">
                           <BellRing className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground pt-1">
                            {timeAgo(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                    <p>You have no notifications yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}

export default function NotificationsPage() {
    return <NotificationsContent />
}
