
import { Button } from "@/components/ui/button";
import { Sparkles, FileText, List } from "lucide-react";

type QuickActionsProps = {
  onAction: (action: string) => void;
  disabled?: boolean;
};

const QuickActions = ({ onAction, disabled = false }: QuickActionsProps) => {
  const actions = [
    {
      name: "Summarize",
      icon: <Sparkles className="h-4 w-4" />,
      prompt: "Summarize the key points from these documents."
    },
    {
      name: "Key Points",
      icon: <List className="h-4 w-4" />,
      prompt: "Extract and list the main key points from these documents."
    },
    {
      name: "Simplify",
      icon: <FileText className="h-4 w-4" />,
      prompt: "Explain the content of these documents in simpler terms."
    }
  ];

  const handleAction = (prompt: string) => {
    if (!disabled) {
      console.log("QuickAction triggered:", prompt);
      onAction(prompt);
    }
  };

  return (
    <div className="flex justify-center space-x-2">
      {actions.map((action) => (
        <Button
          key={action.name}
          variant="outline"
          className="flex items-center space-x-1"
          disabled={disabled}
          onClick={() => handleAction(action.prompt)}
        >
          {action.icon}
          <span>{action.name}</span>
        </Button>
      ))}
    </div>
  );
};

export default QuickActions;
