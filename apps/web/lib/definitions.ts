// apps/web/lib/definitions.ts

import { ItemType } from '@prisma/client'; // Import enum from generated client

// Defines the types of content blocks we can have
export type SectionKind = 'text' | 'header' | 'quote' | 'image';

// Base interface for all sections
export interface Section {
  id: string; // Unique ID for React keys, e.g., cuid()
  kind: SectionKind;
  content: any; // The data for the block
}

// Specific section content types
export interface TextContent {
  text: string; // Rich text (e.g., Markdown or HTML)
}

export interface HeaderContent {
  text: string;
  level: 1 | 2 | 3;
}

export interface QuoteContent {
  text: string;
  caption: string;
}

export interface ImageContent {
  src: string; // URL from Vercel Blob
  caption: string;
}

// This is the structure that will be saved as JSON in the Tab.sections field
export type ContentSection =
  | (Section & { kind: 'text'; content: TextContent })
  | (Section & { kind: 'header'; content: HeaderContent })
  | (Section & { kind: 'quote'; content: QuoteContent })
  | (Section & { kind: 'image'; content: ImageContent });

// Represents the state of a single tab in the editor
export interface EditorTab {
  id: string; // cuid()
  title: string;
  order: number;
  sections: ContentSection[];
}

// Represents the overall state of the item being edited
export interface EditorItemState {
  title: string;
  type: ItemType;
  tabs: EditorTab[];
  // Event-specific details (if type is EVENT)
  eventDetails?: {
    startAt: Date | null;
    endAt: Date | null;
    venue: string;
  };
}