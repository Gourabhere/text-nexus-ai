
import { useState } from "react";
import { File, FileText, Search, Trash2, Download } from "lucide-react";
import { FileType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

type FileLibraryProps = {
  files: FileType[];
  onSelectFile: (fileId: string) => void;
  onDeleteFile: (fileId: string) => void;
  selectedFiles: string[];
};

const FileLibrary = ({
  files,
  onSelectFile,
  onDeleteFile,
  selectedFiles
}: FileLibraryProps) => {
  const [search, setSearch] = useState("");

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(search.toLowerCase())
  );

  const getFileIcon = (fileType: string) => {
    const extension = fileType.split('/').pop();
    switch (extension) {
      case 'pdf':
        return <File className="h-4 w-4 text-red-500" />;
      case 'doc':
      case 'docx':
      case 'msword':
      case 'vnd.openxmlformats-officedocument.wordprocessingml.document':
        return <File className="h-4 w-4 text-blue-500" />;
      case 'txt':
      case 'plain':
        return <FileText className="h-4 w-4 text-gray-500" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFakeDownload = (fileName: string) => {
    toast.success(`${fileName} downloaded successfully!`);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search files..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      
      {filteredFiles.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No files found</p>
        </div>
      ) : (
        <div className="space-y-1 max-h-[500px] overflow-y-auto">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              onClick={() => onSelectFile(file.id)}
              className={cn(
                "flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-muted/70 transition-colors",
                selectedFiles.includes(file.id) ? "bg-muted" : ""
              )}
            >
              <div className="flex items-center space-x-3 overflow-hidden">
                {getFileIcon(file.type)}
                <div className="overflow-hidden">
                  <p className="font-medium text-sm truncate">{file.name}</p>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <span>{formatFileSize(file.size)}</span>
                    <span>•</span>
                    <span>{formatDate(file.uploadedAt)}</span>
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
                    <svg 
                      width="15" 
                      height="3" 
                      viewBox="0 0 15 3" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-muted-foreground"
                    >
                      <path 
                        d="M1.5 1.5C1.5 2.05228 1.05228 2.5 0.5 2.5C-0.0522842 2.5 -0.5 2.05228 -0.5 1.5C-0.5 0.947716 -0.0522842 0.5 0.5 0.5C1.05228 0.5 1.5 0.947716 1.5 1.5Z" 
                        fill="currentColor" 
                        stroke="currentColor" 
                      />
                      <path 
                        d="M8.5 1.5C8.5 2.05228 8.05228 2.5 7.5 2.5C6.94772 2.5 6.5 2.05228 6.5 1.5C6.5 0.947716 6.94772 0.5 7.5 0.5C8.05228 0.5 8.5 0.947716 8.5 1.5Z" 
                        fill="currentColor" 
                        stroke="currentColor" 
                      />
                      <path 
                        d="M15.5 1.5C15.5 2.05228 15.0523 2.5 14.5 2.5C13.9477 2.5 13.5 2.05228 13.5 1.5C13.5 0.947716 13.9477 0.5 14.5 0.5C15.0523 0.5 15.5 0.947716 15.5 1.5Z" 
                        fill="currentColor" 
                        stroke="currentColor" 
                      />
                    </svg>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={() => handleFakeDownload(file.name)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteFile(file.id);
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
    </div>
  );
};

export default FileLibrary;
