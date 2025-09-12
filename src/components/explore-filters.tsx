
"use client";

import { useState, useEffect } from "react";
import { states } from "@/lib/india-states-districts";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Filters } from "@/app/explore/page";
import { LayoutGrid, LayoutList } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";

interface ExploreFiltersProps {
    onFilterChange: (filters: Filters) => void;
}

export function ExploreFilters({ onFilterChange }: ExploreFiltersProps) {
  const { user } = useAuth();
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [districts, setDistricts] = useState<string[]>([]);
  const [currentFilters, setCurrentFilters] = useState<Filters>({ sortBy: 'newest' });

   useEffect(() => {
    onFilterChange(currentFilters);
  }, [currentFilters, onFilterChange]);

  useEffect(() => {
    const fetchUserLocation = async () => {
        if (user) {
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists() && userSnap.data().state && userSnap.data().district) {
                const { state, district } = userSnap.data();
                
                const stateData = states.find(s => s.state === state);
                if (stateData) {
                    setSelectedState(state);
                    setDistricts(stateData.districts);
                    setSelectedDistrict(district);
                    setCurrentFilters(prev => ({...prev, state, district}));
                }
            }
        }
    };
    fetchUserLocation();
  }, [user]);


  const updateUserLocation = async (state: string, district: string) => {
    if (user) {
      const userRef = doc(db, "users", user.uid);
      try {
        await updateDoc(userRef, { state, district });
      } catch (error) {
        console.error("Error updating user location:", error);
      }
    }
  };


  const handleStateChange = (stateName: string) => {
    setSelectedState(stateName);
    const selectedStateData = states.find(s => s.state === stateName);
    setDistricts(selectedStateData ? selectedStateData.districts : []);
    setSelectedDistrict(""); // Reset district
    
    handleFilterChange('state', stateName);
    handleFilterChange('district', undefined); 
  };
  
  const handleDistrictChange = (districtName: string) => {
    setSelectedDistrict(districtName);
    handleFilterChange('district', districtName);
    if (selectedState && districtName) {
      updateUserLocation(selectedState, districtName);
    }
  };

  const handleFilterChange = (filterName: keyof Filters, value: string | undefined) => {
    setCurrentFilters(prev => {
        const newFilters = {...prev, [filterName]: value};
        if (value === undefined || value === 'all') {
            delete (newFilters as any)[filterName];
        }
        return newFilters;
    });
  };

  const filterOptions = [
    {
      label: "State",
      value: "state",
      options: states.map(s => ({ value: s.state, label: s.state })),
      onChange: handleStateChange,
      selectedValue: selectedState,
    },
    {
      label: "District",
      value: "district",
      options: districts.map(d => ({ value: d, label: d })),
      disabled: !selectedState,
      onChange: handleDistrictChange,
      selectedValue: selectedDistrict,
    },
     {
      label: "Status",
      value: "status",
      options: [
        { value: "Pending", label: "Pending" },
        { value: "Confirmation", label: "Confirmation" },
        { value: "Acknowledgment", label: "Acknowledgment" },
        { value: "Resolution", label: "Resolution" },
      ],
      onChange: (value: string) => handleFilterChange('status', value),
      selectedValue: currentFilters.status,
    },
    {
      label: "Sort by",
      value: "sortBy",
      options: [
        { value: "newest", label: "Newest" },
        { value: "popular", label: "Most Popular" },
        { value: "trending", label: "Trending" },
      ],
      onChange: (value: string) => handleFilterChange('sortBy', value),
      selectedValue: currentFilters.sortBy,
    },
  ];

  return (
    <div className="mb-8 flex flex-col gap-4 rounded-xl border bg-card/50 p-4 backdrop-blur-lg md:flex-row md:items-center md:justify-between">
      <div className="flex-1 overflow-x-auto md:overflow-visible pb-2 no-scrollbar">
        <div className="flex gap-4 md:items-center">
          {filterOptions.map(filter => (
             <Select
                key={filter.value}
                onValueChange={filter.onChange}
                disabled={!!filter.disabled}
                value={filter.selectedValue || ''}
            >
              <SelectTrigger className="w-40 min-w-40 rounded-full border-0 bg-secondary/70 backdrop-blur-sm text-muted-foreground hover:text-foreground transition-colors">
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All {filter.label}</SelectItem>
                  {filter.options.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          ))}
        </div>
      </div>
      <div className="hidden items-center gap-1 rounded-full bg-secondary/70 p-1 backdrop-blur-sm md:flex">
          <Button size="icon" variant="ghost" className="rounded-full bg-background text-foreground shadow-sm">
              <LayoutGrid className="h-5 w-5" />
          </Button>
          <Button size="icon" variant="ghost" className="rounded-full text-muted-foreground">
              <LayoutList className="h-5 w-5" />
          </Button>
      </div>
    </div>
  );
}
