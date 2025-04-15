
import { useState } from "react";
import { 
  MessageSquare, 
  Search, 
  Plus, 
  MoreVertical, 
  Trash2, 
  PenSquare 
} from "lucide-react";
import { ChatSessionType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";

type ChatSessionsListProps = {
  sessions: ChatSessionType[];
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onCreateSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  onRenameSession: (sessionId: string, newName: string) => void;
};

const ChatSessionsList = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  onRenameSession
}: ChatSessionsListProps) => {
  const [search, setSearch] = useState("");
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameSessionId, setRenameSessionId] = useState<string | null>(null);
  const [newSessionName, setNewSessionName] = useState("");
  
  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(search.toLowerCase())
  );
  
  const formatDate = (date: Date) => {
    const today = new Date();
    const sessionDate = new Date(date);
    
    if (sessionDate.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (sessionDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    return sessionDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  const handleRename = (sessionId: string, currentName: string) => {
    setRenameSessionId(sessionId);
    setNewSessionName(currentName);
    setRenameDialogOpen(true);
  };
  
  const submitRename = () => {
    if (renameSessionId && newSessionName.trim()) {
      onRenameSession(renameSessionId, newSessionName.trim());
      setRenameDialogOpen(false);
      setRenameSessionId(null);
      setNewSessionName("");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search chats..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button 
          size="icon" 
          onClick={onCreateSession}
          className="ml-2"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      {filteredSessions.length === 0 ? (
        <div className="text-center py-8">
          <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No chats found</p>
        </div>
      ) : (
        <div className="space-y-1 max-h-[500px] overflow-y-auto">
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={cn(
                "flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-muted/70 transition-colors",
                activeSessionId === session.id ? "bg-muted" : ""
              )}
            >
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className={cn(
                  "rounded-full flex items-center justify-center h-8 w-8",
                  activeSessionId === session.id ? "bg-primary text-primary-foreground" : "bg-secondary"
                )}>
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div className="overflow-hidden">
                  <p className="font-medium text-sm truncate">{session.title}</p>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <span>{session.files.length} {session.files.length === 1 ? "file" : "files"}</span>
                    <span>•</span>
                    <span>{formatDate(session.createdAt)}</span>
                  </div>
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    handleRename(session.id, session.title);
                  }}>
                    <PenSquare className="h-4 w-4 mr-2" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}
      
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Chat</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newSessionName}
              onChange={(e) => setNewSessionName(e.target.value)}
              placeholder="Chat name"
              className="w-full"
              autoFocus
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={submitRename} disabled={!newSessionName.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatSessionsList;
