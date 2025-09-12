import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const notifications = [
  {
    user: "Ravi Kumar",
    avatar: "https://picsum.photos/id/1005/48/48",
    action: "reported a new issue:",
    details: "Large Pothole on Main St",
    time: "5m ago",
    type: "New Issue",
    read: false,
  },
  {
    user: "Priya Sharma",
    avatar: "https://picsum.photos/id/1011/48/48",
    action: "commented on issue IS-002",
    details: "'Thank you for the update!'",
    time: "1h ago",
    type: "Comment",
    read: false,
  },
  {
    user: "System",
    avatar: null,
    action: "assigned issue IS-004 to",
    details: "Public Works Dept.",
    time: "3h ago",
    type: "Assignment",
    read: true,
  },
  {
    user: "Anjali Singh",
    avatar: "https://picsum.photos/id/1027/48/48",
    action: "updated status for IS-003 to",
    details: "Resolution",
    time: "1d ago",
    type: "Status Update",
    read: true,
  },
    {
    user: "Amit Patel",
    avatar: "https://picsum.photos/id/10/48/48",
    action: "reported a new issue:",
    details: "Fallen Tree Blocking Road",
    time: "2d ago",
    type: "New Issue",
    read: true,
  },
];

export default function AdminNotificationsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Recent activities and alerts from the platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notifications.map((notification, index) => (
            <div
              key={index}
              className={`flex items-start gap-4 p-4 rounded-lg border ${
                !notification.read ? "bg-secondary/50" : "bg-transparent"
              }`}
            >
              <Avatar className="mt-1">
                {notification.avatar && <AvatarImage src={notification.avatar} />}
                <AvatarFallback>
                  {notification.user?.split(" ").map((n) => n[0]).join("") || "S"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-semibold">{notification.user}</span>{" "}
                  {notification.action}{" "}
                  <span className="font-medium text-primary">
                    {notification.details}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
              </div>
              <Badge variant="outline">{notification.type}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
