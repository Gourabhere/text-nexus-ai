import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Toaster } from "@/components/ui/sonner";
import { FileType, MessageType, ChatSessionType } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger
} from "@/components/ui/sheet";
import { toast } from "@/components/ui/sonner";
import FileUpload from "@/components/FileUpload";
import ChatInterface from "@/components/ChatInterface";
import AppSidebar from "@/components/AppSidebar";
import QuickActions from "@/components/QuickActions";
import { processDocument, extractTextFromFile, getAIResponse, getMockChatSessions } from "@/services/api";
import { Menu } from "lucide-react";

const Index = () => {
  const [sessions, setSessions] = useState<ChatSessionType[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [allFiles, setAllFiles] = useState<FileType[]>([]);
  const [fileContents, setFileContents] = useState<{[key: string]: string}>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Initialize with mock data
  useEffect(() => {
    const mockSessions = getMockChatSessions();
    setSessions(mockSessions);
    
    // Extract all unique files from the mock sessions
    const uniqueFiles: {[key: string]: FileType} = {};
    mockSessions.forEach(session => {
      session.files.forEach(file => {
        uniqueFiles[file.id] = file;
      });
    });
    setAllFiles(Object.values(uniqueFiles));
    
    // Set the first session as active
    if (mockSessions.length > 0) {
      setActiveSessionId(mockSessions[0].id);
      setSelectedFiles(mockSessions[0].files.map(f => f.id));
      
      // Set mock file contents for each file (in a real app, this would come from the server)
      mockSessions[0].files.forEach(file => {
        setFileContents(prev => ({
          ...prev,
          [file.id]: `Mock content for file: ${file.name}. This is a sample text that would typically be extracted from the file.`
        }));
      });
    }
  }, []);
  
  const activeSession = sessions.find(s => s.id === activeSessionId);
  
  const handleFileUpload = async (files: File[]) => {
    setIsProcessing(true);
    
    try {
      // Process each file
      const processedFiles = await Promise.all(
        files.map(async (file) => {
          const processedFile = await processDocument(file);
          
          // Extract text content from the file
          const textContent = await extractTextFromFile(file);
          
          // Store the content
          setFileContents(prev => ({
            ...prev,
            [processedFile.id]: textContent
          }));
          
          return processedFile;
        })
      );
      
      // Add files to allFiles state
      setAllFiles(prev => [...prev, ...processedFiles]);
      
      // If no active session, create a new one
      if (!activeSessionId) {
        const newSessionId = uuidv4();
        const newSession: ChatSessionType = {
          id: newSessionId,
          title: files.length === 1 
            ? files[0].name.split('.')[0] 
            : `New Chat (${new Date().toLocaleDateString()})`,
          files: processedFiles,
          messages: [],
          createdAt: new Date()
        };
        
        setSessions(prev => [...prev, newSession]);
        setActiveSessionId(newSessionId);
        setSelectedFiles(processedFiles.map(f => f.id));
      } else {
        // Add files to the active session
        setSessions(prev => 
          prev.map(session => 
            session.id === activeSessionId 
              ? { ...session, files: [...session.files, ...processedFiles] } 
              : session
          )
        );
        setSelectedFiles(prev => [...prev, ...processedFiles.map(f => f.id)]);
      }
      
      toast.success(`${files.length} ${files.length === 1 ? 'file' : 'files'} processed successfully`);
    } catch (error) {
      console.error('Error processing files:', error);
      toast.error("Error processing files. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!activeSessionId) {
      toast.error("Please create or select a session first");
      return;
    }
    
    // Add user message to the session
    const userMessageId = uuidv4();
    const userMessage: MessageType = {
      id: userMessageId,
      role: "user",
      content: message,
      timestamp: new Date()
    };
    
    setSessions(prev => 
      prev.map(session => 
        session.id === activeSessionId 
          ? { ...session, messages: [...session.messages, userMessage] } 
          : session
      )
    );
    
    setIsProcessing(true);
    
    try {
      // Get the content of all selected files in the active session
      const activeSessionFiles = sessions
        .find(s => s.id === activeSessionId)?.files || [];
      
      const selectedSessionFiles = activeSessionFiles.filter(
        file => selectedFiles.includes(file.id)
      );
      
      if (selectedSessionFiles.length === 0) {
        toast.warning("Please select at least one file to analyze");
        
        // Add system message indicating no files selected
        const systemMessage: MessageType = {
          id: uuidv4(),
          role: "assistant",
          content: "Please select at least one file to analyze.",
          timestamp: new Date()
        };
        
        setSessions(prev => 
          prev.map(session => 
            session.id === activeSessionId 
              ? { ...session, messages: [...session.messages, systemMessage] } 
              : session
          )
        );
        return;
      }
      
      // Get contents of selected files
      const contents = selectedSessionFiles
        .map(file => fileContents[file.id] || "")
        .filter(content => content.trim() !== "");
      
      console.log("File contents being sent to AI:", contents.map((c, i) => 
        `File ${i+1}: ${c.substring(0, 50)}...`
      ));
      
      // Get AI response
      const aiResponse = await getAIResponse(message, contents);
      
      // Add assistant message to the session
      const assistantMessageId = uuidv4();
      const assistantMessage: MessageType = {
        id: assistantMessageId,
        role: "assistant",
        content: aiResponse,
        timestamp: new Date()
      };
      
      setSessions(prev => 
        prev.map(session => 
          session.id === activeSessionId 
            ? { ...session, messages: [...session.messages, assistantMessage] } 
            : session
        )
      );
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast.error("Error generating response. Please try again.");
      
      // Add error message to the session
      const errorMessage: MessageType = {
        id: uuidv4(),
        role: "assistant",
        content: "Sorry, I encountered an error while processing your request. Please try again.",
        timestamp: new Date()
      };
      
      setSessions(prev => 
        prev.map(session => 
          session.id === activeSessionId 
            ? { ...session, messages: [...session.messages, errorMessage] } 
            : session
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRegenerateResponse = async () => {
    if (!activeSessionId) return;
    
    const session = sessions.find(s => s.id === activeSessionId);
    if (!session) return;
    
    const messages = session.messages;
    if (messages.length < 2) return;
    
    // Get the last user message
    const lastUserMessageIndex = [...messages].reverse().findIndex(m => m.role === "user");
    if (lastUserMessageIndex === -1) return;
    
    const lastUserMessage = [...messages].reverse()[lastUserMessageIndex];
    
    // Remove the last assistant message
    setSessions(prev => 
      prev.map(session => 
        session.id === activeSessionId 
          ? { 
              ...session, 
              messages: session.messages.filter(m => 
                m.role !== "assistant" || 
                m.id !== session.messages[session.messages.length - 1].id
              )
            } 
          : session
      )
    );
    
    // Generate a new response
    setIsProcessing(true);
    
    try {
      // Get the content of all files in the active session
      const sessionFiles = session.files;
      const contents = sessionFiles.map(file => fileContents[file.id] || "");
      
      // Get AI response
      const aiResponse = await getAIResponse(lastUserMessage.content, contents);
      
      // Add assistant message to the session
      const assistantMessageId = uuidv4();
      const assistantMessage: MessageType = {
        id: assistantMessageId,
        role: "assistant",
        content: aiResponse,
        timestamp: new Date()
      };
      
      setSessions(prev => 
        prev.map(session => 
          session.id === activeSessionId 
            ? { ...session, messages: [...session.messages, assistantMessage] } 
            : session
        )
      );
    } catch (error) {
      console.error('Error regenerating response:', error);
      toast.error("Error regenerating response. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateSession = () => {
    const newSessionId = uuidv4();
    const newSession: ChatSessionType = {
      id: newSessionId,
      title: `New Chat (${new Date().toLocaleDateString()})`,
      files: [],
      messages: [],
      createdAt: new Date()
    };
    
    setSessions(prev => [...prev, newSession]);
    setActiveSessionId(newSessionId);
    setSelectedFiles([]);
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(session => session.id !== sessionId));
    
    if (activeSessionId === sessionId) {
      const remainingSessions = sessions.filter(session => session.id !== sessionId);
      setActiveSessionId(remainingSessions.length > 0 ? remainingSessions[0].id : null);
      setSelectedFiles(
        remainingSessions.length > 0 
          ? remainingSessions[0].files.map(f => f.id)
          : []
      );
    }
  };

  const handleRenameSession = (sessionId: string, newName: string) => {
    setSessions(prev => 
      prev.map(session => 
        session.id === sessionId 
          ? { ...session, title: newName } 
          : session
      )
    );
  };

  const handleSelectFile = (fileId: string) => {
    if (selectedFiles.includes(fileId)) {
      setSelectedFiles(prev => prev.filter(id => id !== fileId));
    } else {
      setSelectedFiles(prev => [...prev, fileId]);
    }
  };

  const handleDeleteFile = (fileId: string) => {
    // Remove file from allFiles
    setAllFiles(prev => prev.filter(file => file.id !== fileId));
    
    // Remove file from sessions
    setSessions(prev => 
      prev.map(session => ({
        ...session,
        files: session.files.filter(file => file.id !== fileId)
      }))
    );
    
    // Remove from selected files
    setSelectedFiles(prev => prev.filter(id => id !== fileId));
    
    // Remove file content
    setFileContents(prev => {
      const updated = { ...prev };
      delete updated[fileId];
      return updated;
    });
  };

  const handleQuickAction = (prompt: string) => {
    handleSendMessage(prompt);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <AppSidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={setActiveSessionId}
          onCreateSession={handleCreateSession}
          onDeleteSession={handleDeleteSession}
          onRenameSession={handleRenameSession}
          onSelectFile={handleSelectFile}
          onDeleteFile={handleDeleteFile}
          selectedFiles={selectedFiles}
          allFiles={allFiles}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>
      
      {/* Mobile sidebar */}
      <div className="md:hidden">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="absolute top-4 left-4 z-10">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-80">
            <AppSidebar
              sessions={sessions}
              activeSessionId={activeSessionId}
              onSelectSession={(id) => {
                setActiveSessionId(id);
                setMobileMenuOpen(false);
              }}
              onCreateSession={handleCreateSession}
              onDeleteSession={handleDeleteSession}
              onRenameSession={handleRenameSession}
              onSelectFile={handleSelectFile}
              onDeleteFile={handleDeleteFile}
              selectedFiles={selectedFiles}
              allFiles={allFiles}
              collapsed={false}
              onToggleCollapse={() => {}}
            />
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex flex-col">
          {/* Main content area */}
          <div className="h-full flex flex-col lg:flex-row">
            {/* Chat area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto">
                <ChatInterface
                  files={activeSession?.files || []}
                  messages={activeSession?.messages || []}
                  onSendMessage={handleSendMessage}
                  onRegenerate={handleRegenerateResponse}
                  isProcessing={isProcessing}
                />
              </div>
              
              {/* Quick actions */}
              {activeSession?.files.length > 0 && (
                <div className="p-4 border-t">
                  <QuickActions 
                    onAction={handleQuickAction}
                    disabled={isProcessing} 
                  />
                </div>
              )}
            </div>
            
            {/* Upload area on desktop */}
            <div className="hidden lg:block w-80 border-l p-4 overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Upload Documents</h3>
              <FileUpload onFileUpload={handleFileUpload} />
            </div>
          </div>
          
          {/* Upload area on mobile */}
          <div className="lg:hidden border-t p-4">
            <details className="group">
              <summary className="flex justify-between items-center cursor-pointer list-none">
                <h3 className="text-lg font-semibold">Upload Documents</h3>
                <svg 
                  width="15" 
                  height="15" 
                  viewBox="0 0 15 15" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4 transition-transform group-open:rotate-180"
                >
                  <path 
                    d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z" 
                    fill="currentColor" 
                    fillRule="evenodd" 
                    clipRule="evenodd"
                  ></path>
                </svg>
              </summary>
              <div className="pt-4">
                <FileUpload onFileUpload={handleFileUpload} />
              </div>
            </details>
          </div>
        </div>
      </div>
      
      <Toaster />
    </div>
  );
};

export default Index;
