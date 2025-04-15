
import { useState } from "react";
import { ChatSessionType } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import ChatSessionsList from "./ChatSessionsList";
import FileLibrary from "./FileLibrary";
import { MessageSquare, FileText } from "lucide-react";

type AppSidebarProps = {
  sessions: ChatSessionType[];
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onCreateSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  onRenameSession: (sessionId: string, newName: string) => void;
  onSelectFile: (fileId: string) => void;
  onDeleteFile: (fileId: string) => void;
  selectedFiles: string[];
  allFiles: any[];
  collapsed: boolean;
  onToggleCollapse: () => void;
};

const AppSidebar = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  onRenameSession,
  onSelectFile,
  onDeleteFile,
  selectedFiles,
  allFiles,
  collapsed,
  onToggleCollapse
}: AppSidebarProps) => {
  const [activeTab, setActiveTab] = useState("chats");
  
  if (collapsed) {
    return (
      <div className="w-16 border-r flex flex-col items-center py-4 bg-sidebar">
        <div className="flex flex-col items-center space-y-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-sidebar-foreground"
            onClick={() => {
              setActiveTab("chats");
              onToggleCollapse();
            }}
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="text-sidebar-foreground"
            onClick={() => {
              setActiveTab("files");
              onToggleCollapse();
            }}
          >
            <FileText className="h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-80 border-r h-full bg-sidebar">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="font-bold text-xl text-sidebar-foreground">TextNexus AI</h2>
        <Button variant="ghost" size="icon" onClick={onToggleCollapse}>
          <svg 
            width="15" 
            height="15" 
            viewBox="0 0 15 15" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4"
          >
            <path 
              d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z" 
              fill="currentColor" 
              fillRule="evenodd" 
              clipRule="evenodd"
            ></path>
          </svg>
        </Button>
      </div>
      
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 m-4">
          <TabsTrigger value="chats">
            <MessageSquare className="h-4 w-4 mr-2" />
            Chats
          </TabsTrigger>
          <TabsTrigger value="files">
            <FileText className="h-4 w-4 mr-2" />
            Files
          </TabsTrigger>
        </TabsList>
        
        <div className="p-4 h-[calc(100vh-8rem)] overflow-y-auto">
          <TabsContent value="chats" className="mt-0">
            <ChatSessionsList
              sessions={sessions}
              activeSessionId={activeSessionId}
              onSelectSession={onSelectSession}
              onCreateSession={onCreateSession}
              onDeleteSession={onDeleteSession}
              onRenameSession={onRenameSession}
            />
          </TabsContent>
          
          <TabsContent value="files" className="mt-0">
            <FileLibrary
              files={allFiles}
              onSelectFile={onSelectFile}
              onDeleteFile={onDeleteFile}
              selectedFiles={selectedFiles}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default AppSidebar;
