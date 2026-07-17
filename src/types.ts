//Shared TypeScript types used across the virtualized infinite table


export type ItemStatus ="Active" |"Pending" |"Closed";
export interface Item{
   id: number;
  name: string;
  email: string;
  company: string;
  city: string;
}

export interface PageResponse{
  data:Item[];
  nextCursor: number| null;
  hasMore:boolean;
}
