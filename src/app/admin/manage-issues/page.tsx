
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const issues = [
  {
    id: "IS-001",
    title: "Large Pothole on Main St",
    reporter: "Ravi Kumar",
    category: "Roads",
    status: "Confirmation",
    date: "2024-07-28",
    imageUrl: "https://picsum.photos/800/600?random=1",
  },
  {
    id: "IS-002",
    title: "Streetlight not working",
    reporter: "Priya Sharma",
    category: "Electricity",
    status: "Pending",
    date: "2024-07-28",
    imageUrl: "https://picsum.photos/800/600?random=2",
  },
  {
    id: "IS-003",
    title: "Garbage overflow",
    reporter: "Anonymous",
    category: "Sanitation",
    status: "Resolution",
    date: "2024-07-27",
    imageUrl: "https://picsum.photos/800/600?random=3",
  },
  {
    id: "IS-004",
    title: "Broken Water Pipe",
    reporter: "Anjali Singh",
    category: "Water Supply",
    status: "Acknowledgment",
    date: "2024-07-26",
    imageUrl: "https://picsum.photos/800/600?random=4",
  },
  {
    id: "IS-005",
    title: "Fallen Tree Blocking Road",
    reporter: "Amit Patel",
    category: "Public Safety",
    status: "Pending",
    date: "2024-07-25",
    imageUrl: "https://picsum.photos/800/600?random=5",
  },
  {
    id: "IS-006",
    title: "Open Manhole Cover",
    reporter: "Sunita Devi",
    category: "Sanitation",
    status: "Confirmation",
    date: "2024-07-24",
    imageUrl: "https://picsum.photos/800/600?random=6",
  },
];

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  Pending: "destructive",
  Confirmation: "secondary",
  Acknowledgment: "outline",
  Resolution: "default",
};

export default function ManageIssuesPage() {
  return (
    <div>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Manage Issues</CardTitle>
          <CardDescription>
            Review, update, and resolve reported civic issues.
          </CardDescription>
        </CardHeader>
      </Card>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {issues.map((issue) => (
          <Card key={issue.id} className="flex flex-col overflow-hidden">
            <Link href={`/admin/dashboard/manage-issues/${issue.id}`} className="block hover:opacity-90 transition-opacity">
              <div className="relative aspect-video">
                <Image 
                  src={issue.imageUrl}
                  alt={issue.title}
                  fill
                  className="object-cover"
                />
              </div>
            </Link>
            <CardHeader>
              <div className="flex justify-between items-start">
                 <Link href={`/admin/dashboard/manage-issues/${issue.id}`} className="block">
                    <CardTitle className="text-lg hover:underline">{issue.title}</CardTitle>
                 </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button aria-haspopup="true" size="icon" variant="ghost" className="shrink-0">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                        <Link href={`/admin/dashboard/manage-issues/${issue.id}`} className="w-full h-full">
                            View Details
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>Update Status</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardDescription>ID: {issue.id}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Reporter</p>
                <p className="text-sm">{issue.reporter}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Category</p>
                <p className="text-sm">{issue.category}</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
                <Badge variant={statusVariant[issue.status]}>{issue.status}</Badge>
                <p className="text-sm text-muted-foreground">{issue.date}</p>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
