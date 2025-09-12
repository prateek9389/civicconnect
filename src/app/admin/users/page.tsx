import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
  } from "@/components/ui/dropdown-menu";

const users = [
  {
    name: "Ravi Kumar",
    email: "ravi.kumar@example.com",
    role: "User",
    issuesReported: 15,
    joinDate: "2023-01-15",
    avatar: "https://picsum.photos/id/1005/48/48",
  },
  {
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    role: "User",
    issuesReported: 8,
    joinDate: "2023-02-20",
    avatar: "https://picsum.photos/id/1011/48/48",
  },
  {
    name: "Anjali Singh",
    email: "anjali.singh@example.com",
    role: "Admin",
    issuesReported: 0,
    joinDate: "2023-03-10",
    avatar: "https://picsum.photos/id/1027/48/48",
  },
  {
    name: "Amit Patel",
    email: "amit.patel@example.com",
    role: "User",
    issuesReported: 22,
    joinDate: "2023-04-05",
    avatar: "https://picsum.photos/id/10/48/48",
  },
  {
    name: "Sunita Devi",
    email: "sunita.devi@example.com",
    role: "User",
    issuesReported: 5,
    joinDate: "2023-05-12",
    avatar: "https://picsum.photos/id/12/48/48",
  },
];

export default function UsersPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          Manage user accounts and permissions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Issues Reported</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.email}>
                <TableCell>
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>
                        {user.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                    <Badge variant={user.role === 'Admin' ? 'default' : 'secondary'}>{user.role}</Badge>
                </TableCell>
                <TableCell>{user.issuesReported}</TableCell>
                <TableCell>{user.joinDate}</TableCell>
                <TableCell>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Profile</DropdownMenuItem>
                      <DropdownMenuItem>Edit Role</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        Suspend
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
