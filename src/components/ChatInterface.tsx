
import { useState, useRef, useEffect } from "react";
import { Send, FileText, RefreshCcw, Bot, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageType, FileType } from "@/types";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';

type ChatInterfaceProps = {
  files: FileType[];
  messages: MessageType[];
  onSendMessage: (message: string) => void;
  onRegenerate?: () => void;
  isProcessing: boolean;
};

const ChatInterface = ({
  files,
  messages,
  onSendMessage,
  onRegenerate,
  isProcessing
}: ChatInterfaceProps) => {
  const [message, setMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current;
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isProcessing) {
      onSendMessage(message.trim());
      setMessage("");
      
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Adjust height based on content
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  if (files.length === 0 && messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-16 h-16 mb-4 bg-primary/10 rounded-full flex items-center justify-center">
          <Bot className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Welcome to TextNexus AI</h3>
        <p className="text-muted-foreground mb-8 max-w-md">
          Upload documents and chat with AI to get insights, summaries, and answers to your questions.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
          {["Summarize", "Extract Key Points", "Answer Questions"].map((action, i) => (
            <div key={i} className="bg-card border rounded-lg p-4 flex flex-col items-center">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <h4 className="font-medium">{action}</h4>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4 pb-4">
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center bg-muted/50 px-3 py-1 rounded-full text-sm"
                >
                  <FileText className="h-3.5 w-3.5 mr-1.5 text-primary" />
                  {file.name}
                </div>
              ))}
            </div>
          )}
          
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div className="flex items-start max-w-[80%]">
                <div className={cn(
                  "rounded-full w-8 h-8 flex items-center justify-center mr-2",
                  msg.role === "user" ? "order-last ml-2" : "order-first mr-2",
                  msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"
                )}>
                  {msg.role === "user" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                <div
                  className={cn(
                    msg.role === "user" ? "chat-bubble-user" : "chat-bubble-assistant",
                    "shadow-sm"
                  )}
                >
                  {msg.role === "user" ? (
                    <div>{msg.content}</div>
                  ) : (
                    <div className="markdown-content">
                      <ReactMarkdown>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isProcessing && (
            <div className="flex justify-start">
              <div className="flex items-start max-w-[80%]">
                <div className="rounded-full w-8 h-8 flex items-center justify-center mr-2 bg-secondary">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="chat-bubble-assistant shadow-sm">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-150"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-300"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <div className="border-t p-4">
        {messages.length > 0 && onRegenerate && (
          <div className="flex justify-center mb-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs" 
              onClick={onRegenerate}
              disabled={isProcessing}
            >
              <RefreshCcw className="h-3 w-3 mr-1" /> Regenerate response
            </Button>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="relative">
          <Textarea
            ref={textareaRef}
            placeholder="Ask about your documents..."
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            className="pr-12 resize-none min-h-[50px] max-h-[200px] py-3"
            disabled={isProcessing || files.length === 0}
          />
          <Button
            type="submit"
            size="icon"
            className="absolute right-2 bottom-2 h-7 w-7"
            disabled={!message.trim() || isProcessing || files.length === 0}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
