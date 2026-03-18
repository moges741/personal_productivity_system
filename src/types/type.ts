export type ReturnProps = {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  timezone: string;
  isVerified: boolean;
        createdAt: Date
}// i did this to fix type problem, i will remove it later when i have time to refactor the code and use UserResponseDto instead of ReturnProps