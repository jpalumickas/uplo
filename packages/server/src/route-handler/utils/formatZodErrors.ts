import { ZodError } from 'zod';

export const formatZodErrors = (error: ZodError) => {
  return error.issues.reduce(
    (acc, issue) => {
      const path = issue.path.join('.');
      acc[path] = issue.message;
      return acc;
    },
    {} as Record<string, string>
  );
};
