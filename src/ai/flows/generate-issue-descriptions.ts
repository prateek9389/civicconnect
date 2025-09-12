'use server';

/**
 * @fileOverview A flow for generating sample issue descriptions for civic issues.
 *
 * - generateIssueDescription - A function that generates an issue description.
 * - IssueDescriptionInput - The input type for the generateIssueDescription function.
 * - IssueDescriptionOutput - The return type for the generateIssueDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IssueDescriptionInputSchema = z.object({
  category: z
    .string()
    .describe('The category of the civic issue (e.g., Roads, Sanitation, Electricity).'),
});

export type IssueDescriptionInput = z.infer<typeof IssueDescriptionInputSchema>;

const IssueDescriptionOutputSchema = z.object({
  description: z
    .string()
    .describe('A detailed description of the civic issue, contextualized by its category.'),
});

export type IssueDescriptionOutput = z.infer<typeof IssueDescriptionOutputSchema>;

export async function generateIssueDescription(
  input: IssueDescriptionInput
): Promise<IssueDescriptionOutput> {
  return generateIssueDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'issueDescriptionPrompt',
  input: {schema: IssueDescriptionInputSchema},
  output: {schema: IssueDescriptionOutputSchema},
  prompt: `You are a helpful AI assistant that specializes in generating realistic issue descriptions for a civic issue reporting application.

Given the category of a civic issue, generate a detailed and contextually relevant description of the issue.

Category: {{{category}}}

Description:`,
});

const generateIssueDescriptionFlow = ai.defineFlow(
  {
    name: 'generateIssueDescriptionFlow',
    inputSchema: IssueDescriptionInputSchema,
    outputSchema: IssueDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
