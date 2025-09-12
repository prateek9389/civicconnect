
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

type IssueSubmittedDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  issueId?: string;
  issueTitle?: string;
};

export function IssueSubmittedDialog({
  isOpen,
  onClose,
  issueId,
  issueTitle,
}: IssueSubmittedDialogProps) {
  const { toast } = useToast();

  const copyToClipboard = () => {
    if (issueId) {
      navigator.clipboard.writeText(issueId);
      toast({
        title: "Copied to clipboard!",
        description: "Issue ID has been copied.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <DialogTitle className="text-center text-2xl font-headline mt-4">
            Issue Reported Successfully!
          </DialogTitle>
          <DialogDescription className="text-center">
            Your report for "{issueTitle}" has been submitted. Thank you for helping improve your community.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-center text-muted-foreground">
            Your issue has been saved with the following ID. You can use it to track the status.
          </p>
          <div className="flex items-center space-x-2 rounded-md border bg-secondary p-2">
            <p className="text-sm font-mono text-muted-foreground truncate flex-1">
              {issueId}
            </p>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={copyToClipboard}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <DialogFooter className="sm:justify-center flex-col sm:flex-row gap-2">
           <Link
            href={`/issue/${issueId}`}
            className="w-full"
            >
                <Button type="button" variant="secondary" className="w-full">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Your Issue
                </Button>
            </Link>
          <Button type="button" onClick={onClose} className="w-full">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
