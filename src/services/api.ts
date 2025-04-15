import { v4 as uuidv4 } from "uuid";
import { FileType, MessageType, ChatSessionType } from "@/types";

// Mock functions for document processing and AI responses
const GEMINI_API_KEY = "AIzaSyAiFZ-Ndm0Ydzv11yJ4Mobmeg7b53by5sw";

// Mock function to simulate processing a document
export const processDocument = async (file: File): Promise<FileType> => {
  // In a real app, you would upload the file to a server
  return new Promise((resolve) => {
    setTimeout(() => {
      const processedFile: FileType = {
        id: uuidv4(),
        name: file.name,
        type: file.type || `application/${file.name.split('.').pop()}`,
        size: file.size,
        uploadedAt: new Date(),
        processed: true
      };
      resolve(processedFile);
    }, 1500); // Simulate processing time
  });
};

// Function to extract text content from a file
export const extractTextFromFile = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      // For text files, use the actual content
      if (file.type === 'text/plain') {
        resolve(reader.result as string);
      } else {
        // For other files, create a more substantial mock content
        resolve(`Content from ${file.name}:\n\nThis document contains information about ${file.name.split('.')[0]}. 
        It includes several sections with details about the topic.
        
        Section 1: Introduction
        This section provides an overview of the main concepts.
        
        Section 2: Key Points
        • First important point related to ${file.name.split('.')[0]}
        • Second important consideration about the topic
        • Third relevant aspect to consider
        
        Section 3: Analysis
        The analysis shows that the information is valuable and can be used for further research.
        
        Section 4: Conclusion
        In conclusion, this document provides useful insights on ${file.name.split('.')[0]}.`);
      }
    };
    reader.readAsText(file);
  });
};

// Function to get AI response using Gemini API with improved error handling
export const getAIResponse = async (
  message: string,
  fileContents: string[]
): Promise<string> => {
  try {
    // Check if there are any file contents to process
    if (!fileContents.length) {
      return "I don't see any document content to analyze. Please upload a document first.";
    }
    
    const cleanedContents = fileContents.filter(content => content && content.trim().length > 0);
    
    if (!cleanedContents.length) {
      return "The uploaded documents appear to be empty or couldn't be processed. Please try uploading different documents.";
    }

    const prompt = `
You are an AI assistant that helps users understand documents they've uploaded.
Always provide well-formatted responses with appropriate paragraphs, bullet points, and sections.

DOCUMENTS CONTENT:
${cleanedContents.join('\n\n=====NEXT DOCUMENT=====\n\n')}

USER QUERY:
${message}

Please provide a comprehensive, well-structured response addressing the user's query based on the document content.
Use bullet points for lists, proper paragraphs for explanations, and clear section headings where appropriate.
`;

    console.log("Sending prompt to Gemini API:", { messageLength: message.length, contentsCount: cleanedContents.length });

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      return `I encountered an error processing your request. Error: ${errorData.error?.message || 'Unknown error'}`;
    }

    const data = await response.json();
    
    // Check if the response has the expected structure
    if (data.candidates && data.candidates.length > 0 && 
        data.candidates[0].content && data.candidates[0].content.parts && 
        data.candidates[0].content.parts.length > 0) {
      return data.candidates[0].content.parts[0].text;
    } else {
      console.error('Unexpected API response structure:', data);
      return "I couldn't generate a proper response due to an unexpected API response format. Please try again with a clearer question or different documents.";
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return "Sorry, there was an error processing your request. Please try again with a shorter question or fewer documents.";
  }
};

// Mock data for initial chat sessions
export const getMockChatSessions = (): ChatSessionType[] => {
  return [
    {
      id: uuidv4(),
      title: "Research Paper Analysis",
      files: [
        {
          id: uuidv4(),
          name: "research_paper.pdf",
          type: "application/pdf",
          size: 2500000,
          uploadedAt: new Date(Date.now() - 86400000), // 1 day ago
          processed: true
        }
      ],
      messages: [
        {
          id: uuidv4(),
          role: "user",
          content: "What are the key findings in this research paper?",
          timestamp: new Date(Date.now() - 86400000 + 3600000)
        },
        {
          id: uuidv4(),
          role: "assistant",
          content: "## Key Findings\n\nThe research paper presents several important findings:\n\n- **Temperature Correlation**: A strong correlation between increased global temperatures and decreased polar ice caps.\n- **Species Migration**: Evidence of 37 species that have altered their migration patterns due to climate changes.\n- **Ocean Acidification**: Measured a 15% increase in ocean acidity levels over the past decade.\n\nThe authors emphasize the need for immediate action to address these environmental challenges and suggest several policy recommendations.",
          timestamp: new Date(Date.now() - 86400000 + 3660000)
        }
      ],
      createdAt: new Date(Date.now() - 86400000)
    },
    {
      id: uuidv4(),
      title: "Financial Report 2024",
      files: [
        {
          id: uuidv4(),
          name: "q1_financial_report.pdf",
          type: "application/pdf",
          size: 1800000,
          uploadedAt: new Date(Date.now() - 172800000), // 2 days ago
          processed: true
        },
        {
          id: uuidv4(),
          name: "market_analysis.docx",
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          size: 950000,
          uploadedAt: new Date(Date.now() - 172700000),
          processed: true
        }
      ],
      messages: [
        {
          id: uuidv4(),
          role: "user",
          content: "Summarize the financial performance this quarter",
          timestamp: new Date(Date.now() - 172800000 + 3600000)
        },
        {
          id: uuidv4(),
          role: "assistant",
          content: "# Q1 2024 Financial Performance Summary\n\n## Revenue\n\nTotal revenue increased by 18% year-over-year to $24.3 million. This growth was primarily driven by:\n\n- New customer acquisition (+12%)\n- Increased spend from existing customers (+23%)\n- Expansion into European markets (+31% regional growth)\n\n## Profitability\n\n- **Gross margin**: Improved to 68% (up from 65% in Q1 2023)\n- **Operating expenses**: $15.8 million (65% of revenue, down from 69%)\n- **Net income**: $2.9 million (12% of revenue)\n\n## Cash Position\n\nCash and cash equivalents stand at $43.2 million, a strong position that supports our planned expansion initiatives for the remainder of the fiscal year.",
          timestamp: new Date(Date.now() - 172800000 + 3660000)
        }
      ],
      createdAt: new Date(Date.now() - 172800000)
    }
  ];
};
