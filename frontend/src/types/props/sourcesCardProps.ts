import type { GoogleResult } from '../models/googleResult';

export interface SourcesCardProps {
  googleResults?: GoogleResult[];
  isLoading: boolean;
  renderGoogleResults: (results: GoogleResult[]) => React.ReactNode;
  renderSourcesSkeleton: () => React.ReactNode;
} 