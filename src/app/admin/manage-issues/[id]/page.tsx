
"use client";

import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
import { ArrowLeft, MessageSquare, Send, UserCheck, ClipboardList } from "lucide-react";
import Link from "next/link";

const issues = [
    {
      id: "IS-001",
      title: "Large Pothole on Main St",
      reporter: "Ravi Kumar",
      category: "Roads",
      status: "Confirmation",
      date: "2024-07-28",
      description: "A large and dangerous pothole has formed on Main Street, near the central library. It has already caused damage to several vehicles. It needs to be repaired urgently to prevent any accidents.",
      district: "Ranchi",
      images: [
        "https://picsum.photos/800/600?random=1",
        "https://picsum.photos/800/600?random=11",
        "https://picsum.photos/800/600?random=12",
      ],
    },
    {
      id: "IS-002",
      title: "Streetlight not working",
      reporter: "Priya Sharma",
      category: "Electricity",
      status: "Pending",
      date: "2024-07-28",
      description: "The streetlight on Elm Street has been out for three days. It's very dark at night and feels unsafe.",
      district: "Dhanbad",
      images: [
        "https://picsum.photos/800/600?random=2",
        "https://picsum.photos/800/600?random=21",
      ],
    },
];

const issue = issues[0]; // Mock: find issue by params.id in a real app

export default function ManageIssueDetailPage({ params }: { params: { id: string } }) {
  
  // In a real app, you would use params.id to fetch the correct issue
  // const issue = issues.find(i => i.id === params.id);
  // if (!issue) return <div>Issue not found</div>;

  return (
    <div className="space-y-8">
        <Link href="/admin/dashboard/manage-issues" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Issues
        </Link>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="text-2xl">{issue.title}</CardTitle>
                    <Badge variant="outline">{issue.category}</Badge>
                </div>
                <CardDescription>ID: {issue.id} | Reported on: {issue.date} | District: {issue.district}</CardDescription>
            </CardHeader>
            <CardContent>
              <Carousel className="w-full mb-6">
                <CarouselContent>
                  {issue.images.map((src, index) => (
                    <CarouselItem key={index}>
                      <div className="aspect-video relative">
                        <Image
                          src={src}
                          alt={`${issue.title} - image ${index + 1}`}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-4" />
                <CarouselNext className="right-4" />
              </Carousel>
              <div>
                <h3 className="font-semibold text-lg mb-2">Description</h3>
                <p className="text-muted-foreground">{issue.description}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5"/> Internal Communication</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Mock chat messages */}
                    <div className="text-sm text-muted-foreground">No messages yet.</div>
                    <div className="flex gap-2">
                        <Textarea placeholder="Type your message... (e.g., @maintenance-team)" />
                        <Button variant="secondary"><Send className="h-4 w-4"/></Button>
                    </div>
                </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><UserCheck className="h-5 w-5" /> Reporter Info</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="font-semibold">{issue.reporter}</p>
                    <p className="text-sm text-muted-foreground">_email_not_available_</p>
                    <Button variant="link" className="p-0 h-auto">View Profile</Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5"/> Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div>
                        <label className="text-sm font-medium">Current Status</label>
                        <Badge className="ml-2">{issue.status}</Badge>
                     </div>
                     <div>
                        <label htmlFor="update-status" className="text-sm font-medium">Update Status</label>
                        <Select>
                            <SelectTrigger id="update-status">
                                <SelectValue placeholder="Select new status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="confirmation">Confirmation</SelectItem>
                                <SelectItem value="acknowledgment">Acknowledgment</SelectItem>
                                <SelectItem value="resolution">Resolution</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                     </div>
                      <div>
                        <label htmlFor="assign-dept" className="text-sm font-medium">Assign Department</label>
                        <Select>
                            <SelectTrigger id="assign-dept">
                                <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                <SelectItem value="pwd">Public Works Dept.</SelectItem>
                                <SelectItem value="electric">Electricity Board</SelectItem>
                                <SelectItem value="water">Water Authority</SelectItem>
                                <SelectItem value="sanitation">Sanitation Dept.</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                     </div>
                     <Button className="w-full">Save Changes</Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
