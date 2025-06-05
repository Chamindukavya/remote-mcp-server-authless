import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// Hardcoded JSON data
const cvData = {
  "name": "Kavya G.A.C.",
  "location": "Matara, Sri Lanka",
  "email": "ckchamindukavya@gmail.com",
  "phone": "0762830590",
  "linkedin": "https://www.linkedin.com/in/chamindu-kavya/",
  "github": "https://github.com/Chamindukavya",
  "summary": "A passionate Computer Science and Engineering undergraduate with a strong interest in 2D game development, web development, and mobile app development. Experienced in building dynamic and interactive applications using Unity for game development, React Native for mobile apps, and modern web technologies like Next.js. Skilled in back-end development with Spring Boot and database management. Eager to apply problem-solving abilities and technical expertise to create innovative and user-centric solutions. Interested in learning and collaborating on challenging projects in software development and game design.",
  "education": {
    "university": "University of Moratuwa",
    "degree": "B.Sc. Undergraduate in Computer Science and Engineering",
    "date": "March 2023"
  },
  "projects": [
    {
      "name": "Shilpa - Educational Resource and Quiz Platform",
      "url": "https://shilpa.org/",
      "description": "Contributed to development of Shilpa, an educational platform built with Next.js and MongoDB. Key features: resource download, teacher advertisements, interactive quizzes, admin panel. Mainly focused on back-end development.",
      "tools": ["TypeScript", "Tailwind CSS", "HTML", "Next.js", "MongoDB"]
    },
    {
      "name": "Air Plane Reservation System",
      "url": "https://github.com/Chamindukavya/AirPlane",
      "description": "Worked on an airplane reservation system using Next.js, Tailwind CSS, and MySQL. Contributed to front-end and back-end including flight search, seat selection, and booking features.",
      "tools": ["MySQL", "Next.js", "Tailwind CSS", "TypeScript", "HTML"]
    },
    {
      "name": "Candle Night",
      "url": "https://celestia.uomleos.org/",
      "description": "Built a website for booking tickets and ordering food for a Leo Club event. Focused mainly on back-end development. Developed both user and admin websites.",
      "tools": ["MongoDB", "Next.js", "Tailwind CSS", "TypeScript", "HTML"]
    },
    {
      "name": "Desert Monster",
      "url": "https://github.com/Chamindukavya/Desrt-Monster",
      "description": "Developed an Android game in Unity where the player avoids cactus trees. A creative hobby project exploring Unity game development.",
      "tools": ["C#", "Unity"]
    },
    {
      "name": "Loan Manager",
      "url": "https://github.com/Chamindukavya/LoanManager",
      "description": "Created a cross-platform loan management app using React Native and Expo. Implemented Appwrite for secure authentication and data storage.",
      "tools": ["React Native", "Expo", "Appwrite"]
    },
    {
      "name": "Movie-App",
      "url": "https://github.com/Chamindukavya/Movie-Mart",
      "description": "Developed back-end of a movie app using Spring Boot and MongoDB. Implemented scalable REST API with CRUD operations and pagination.",
      "tools": ["Java", "Spring Boot", "MongoDB"]
    }
  ],
  "technologies": {
    "languages": ["Python", "C++", "C", "Java", "C#", "SQL", "JavaScript", "HTML", "CSS"],
    "frameworks_and_tools": ["Next.js", "React Native (Expo)", "Spring Boot"]
  }
};

// Define MCP agent with a CV query tool
export class MyMCP extends McpAgent {
  server = new McpServer({
    name: "CV Query Tool",
    version: "1.0.0",
  });

  async init() {
    // Tool to answer questions about the CV
    this.server.tool(
      "queryCV",
      {
        question: z.string().describe("A question about the CV data"),
      },
      async ({ question }) => {
        try {
          // Process the question and extract relevant information from cvData
          let responseText = await this.answerQuestion(question);
          return {
            content: [{ type: "text", text: responseText }],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `Error processing question: ${error}`,
              },
            ],
          };
        }
      }
    );
  }

  // Helper function to process questions and generate responses
  private async answerQuestion(question: string): Promise<string> {
    const lowerQuestion = question.toLowerCase();

    // Handle questions about personal info
    if (lowerQuestion.includes("name")) {
      return `The name is ${cvData.name}.`;
    }
    if (lowerQuestion.includes("location")) {
      return `The location is ${cvData.location}.`;
    }
    if (lowerQuestion.includes("email")) {
      return `The email is ${cvData.email}.`;
    }
    if (lowerQuestion.includes("phone")) {
      return `The phone number is ${cvData.phone}.`;
    }
    if (lowerQuestion.includes("linkedin")) {
      return `The LinkedIn profile is ${cvData.linkedin}.`;
    }
    if (lowerQuestion.includes("github")) {
      return `The GitHub profile is ${cvData.github}.`;
    }
    if (lowerQuestion.includes("summary") || lowerQuestion.includes("about")) {
      return cvData.summary;
    }

    // Handle questions about education
    if (lowerQuestion.includes("education") || lowerQuestion.includes("university") || lowerQuestion.includes("degree")) {
      return `Studying ${cvData.education.degree} at ${cvData.education.university}, starting ${cvData.education.date}.`;
    }

    // Handle questions about projects
    if (lowerQuestion.includes("project") || lowerQuestion.includes("projects")) {
      const projectNames = cvData.projects.map(p => p.name).join(", ");
      if (lowerQuestion.includes("list") || lowerQuestion.includes("all")) {
        return `Projects include: ${projectNames}.`;
      }
      // Check for specific project
      for (const project of cvData.projects) {
        if (lowerQuestion.includes(project.name.toLowerCase())) {
          return `${project.name}: ${project.description} Tools used: ${project.tools.join(", ")}. URL: ${project.url}`;
        }
      }
      return `Available projects: ${projectNames}. Ask about a specific project for details.`;
    }

    // Handle questions about technologies
    if (lowerQuestion.includes("technologies") || lowerQuestion.includes("skills") || lowerQuestion.includes("languages")) {
      const languages = cvData.technologies.languages.join(", ");
      const frameworks = cvData.technologies.frameworks_and_tools.join(", ");
      return `Programming languages: ${languages}. Frameworks and tools: ${frameworks}.`;
    }

    // Default response for unrecognized questions
    return "I'm not sure how to answer that. Please ask about my name, location, contact details, education, projects, or technologies.";
  }
}

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);

    if (url.pathname === "/sse" || url.pathname === "/sse/message") {
      return MyMCP.serveSSE("/sse").fetch(request, env, ctx);
    }

    if (url.pathname === "/mcp") {
      return MyMCP.serve("/mcp").fetch(request, env, ctx);
    }

    return new Response("Not found", { status: 404 });
  },
};