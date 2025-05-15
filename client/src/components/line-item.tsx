import { LineItem as LineItemType } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";

interface LineItemProps {
  index: number;
  item: LineItemType;
  onChange: (index: number, field: keyof LineItemType, value: string | number) => void;
  onDelete: () => void;
  canDelete: boolean;
}

const LineItem = ({ index, item, onChange, onDelete, canDelete }: LineItemProps) => {
  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-8">
        <Label className="block text-sm font-medium text-neutral-500 mb-1">Description</Label>
        <Input
          type="text"
          value={item.description}
          onChange={(e) => onChange(index, "description", e.target.value)}
          required
          className="w-full"
        />
      </div>
      <div className="col-span-3">
        <Label className="block text-sm font-medium text-neutral-500 mb-1">Amount (R)</Label>
        <Input
          type="number"
          value={item.amount}
          onChange={(e) => onChange(index, "amount", e.target.value)}
          step="0.01"
          min="0"
          required
          className="w-full"
        />
      </div>
      <div className="col-span-1 flex items-end">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onDelete}
          disabled={!canDelete}
          className="h-10 w-10 text-neutral-400 hover:text-red-600 disabled:opacity-30"
          title={canDelete ? "Delete line item" : "At least one line item is required"}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default LineItem;
