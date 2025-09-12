"use client"

import * as React from "react"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function DistrictSelect() {
  return (
    <Select>
      <SelectTrigger className="w-full md:w-[180px] rounded-full border-0 bg-secondary/70 backdrop-blur-sm text-muted-foreground hover:text-foreground transition-colors">
        <div className="flex items-center gap-2">
            <SelectValue placeholder="Select District" />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="ranchi">Ranchi</SelectItem>
          <SelectItem value="dhanbad">Dhanbad</SelectItem>
          <SelectItem value="patna">Patna</SelectItem>
          <SelectItem value="lucknow">Lucknow</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
