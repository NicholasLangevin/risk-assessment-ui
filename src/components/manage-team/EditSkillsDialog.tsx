
'use client';

import React, { useState, useEffect } from 'react';
import type { UserProfile, SkillSettings, CaseType } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface EditSkillsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userProfileToEdit: UserProfile;
  onSave: (updatedProfile: UserProfile) => void;
  allCaseTypes: CaseType[];
  allLinesOfBusiness: string[];
  allBranches: string[];
  allBrokerCodes: string[];
}

export function EditSkillsDialog({
  isOpen,
  onOpenChange,
  userProfileToEdit,
  onSave,
  allCaseTypes,
  allLinesOfBusiness,
  allBranches,
  allBrokerCodes,
}: EditSkillsDialogProps) {
  const [currentSkills, setCurrentSkills] = useState<SkillSettings>({
    transactionTypes: [],
    linesOfBusiness: [],
    branches: [],
    brokerCodes: [],
  });

  useEffect(() => {
    if (userProfileToEdit?.skills) {
      setCurrentSkills(JSON.parse(JSON.stringify(userProfileToEdit.skills))); // Deep copy
    } else {
      // Initialize with empty arrays if no skills are set
      setCurrentSkills({
        transactionTypes: [],
        linesOfBusiness: [],
        branches: [],
        brokerCodes: [],
      });
    }
  }, [userProfileToEdit]);

  const handleSave = () => {
    onSave({ ...userProfileToEdit, skills: currentSkills });
    onOpenChange(false);
  };

  type SkillCategory = keyof SkillSettings;

  const handleSkillChange = (category: SkillCategory, value: string, checked: boolean) => {
    setCurrentSkills(prev => {
      const prevCategorySkills = prev[category];
      let newCategorySkills: string[] | 'ALL';

      if (Array.isArray(prevCategorySkills)) {
        if (checked) {
          newCategorySkills = [...prevCategorySkills, value];
        } else {
          newCategorySkills = prevCategorySkills.filter(item => item !== value);
        }
      } else { // It's 'ALL', and we are unchecking 'ALL' or checking a specific item
        newCategorySkills = checked ? [value] : []; // If unchecking ALL, start fresh. If checking specific, start with that.
      }
      return { ...prev, [category]: newCategorySkills };
    });
  };

  const handleSelectAll = (category: SkillCategory, checked: boolean) => {
    setCurrentSkills(prev => ({
      ...prev,
      [category]: checked ? 'ALL' : [],
    }));
  };

  const renderSkillSection = (
    title: string,
    category: SkillCategory,
    options: string[] | readonly CaseType[]
  ) => {
    const currentCategorySkills = currentSkills[category];
    const isAllSelected = currentCategorySkills === 'ALL';

    return (
      <div className="space-y-2">
        <h4 className="font-medium text-md">{title}</h4>
        <div className="flex items-center space-x-2">
          <Checkbox
            id={`${category}-all`}
            checked={isAllSelected}
            onCheckedChange={(checked) => handleSelectAll(category, !!checked)}
          />
          <Label htmlFor={`${category}-all`} className="font-semibold">ALL {title}</Label>
        </div>
        {!isAllSelected && Array.isArray(currentCategorySkills) && (
          <ScrollArea className="h-32 border rounded-md p-2">
            <div className="space-y-1">
              {options.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${category}-${option}`}
                    checked={currentCategorySkills.includes(option)}
                    onCheckedChange={(checked) => handleSkillChange(category, option, !!checked)}
                  />
                  <Label htmlFor={`${category}-${option}`} className="text-sm font-normal">{option}</Label>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
        <Separator className="my-3" />
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Edit Skills for {userProfileToEdit.name}</DialogTitle>
          <DialogDescription>
            Select applicable skills. Choosing "ALL" will override individual selections for that category.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow overflow-y-auto">
          <div className="space-y-4 p-4">
            {renderSkillSection("Transaction Types", "transactionTypes", allCaseTypes)}
            {renderSkillSection("Lines of Business", "linesOfBusiness", allLinesOfBusiness)}
            {renderSkillSection("Branches", "branches", allBranches)}
            {renderSkillSection("Broker Codes", "brokerCodes", allBrokerCodes)}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Skills</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
