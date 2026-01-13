import React from 'react';

export type CategoryType = 'STUDENT' | 'FACULTY' | 'EVENT' | 'COLLAB';

export interface TimelineEntry {
  id: string;
  title: string;
  description: string;
  category: CategoryType;
  date: string; // YYYY-MM-DD
  year: number;
  mediaUrl?: string; // Optional image/pdf link (Legacy)
  mediaUrls?: string[]; // New: Multiple images
  featured: boolean;
  createdAt: number;
}

export interface CategoryConfig {
  id: CategoryType;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  Icon: React.ElementType; // Changed from iconName string to Component
}

export type ViewState = 'TIMELINE' | 'LOGIN' | 'ADMIN';