import { api } from '@/lib/api-client';

export interface AstrologerApplicationPayload {
  fullName: string;
  phone: string;
  email: string;
  profilePhoto: string;
  displayName: string;
  skills: string[];
  otherSkill?: string;
  languages: string[];
  otherLanguage?: string;
  yearsOfExperience: number;
  bio: string;
  specializations?: string;
  consultationExperience?: string;
  location?: string;
  introVideo?: string;
  certificates?: string[];
  documents?: string[];
  isConfirmed: boolean;
  password?: string;
}

export interface AstrologerApplicationResponse {
  id: string;
  applicationId: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  fullName: string;
  displayName: string;
  email: string;
  phone: string;
}

export const applicationsService = {
  async submitApplication(data: AstrologerApplicationPayload): Promise<AstrologerApplicationResponse> {
    const res = await api.post('/astrologer-applications', data);
    return res.data;
  },

  async getStatus(applicationId: string): Promise<any> {
    const res = await api.get(`/astrologer-applications/status/${applicationId}`);
    return res.data;
  },
};
