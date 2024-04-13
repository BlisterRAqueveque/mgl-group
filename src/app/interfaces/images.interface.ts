export interface Images {
  id: number;
  img: string;
  comment: string;
  type: string;
  dot: { name: string; code: string } | undefined;
  mimeType: string;
  originalImg: string;
  edited: boolean;
}
