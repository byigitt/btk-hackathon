import type { GoogleResult } from '../models/googleResult';

export interface VideoCardProps {
    video: GoogleResult;
    isLoading?: boolean;
}