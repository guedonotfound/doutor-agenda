import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";
import { useState } from "react";

export function DateFilter({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: Date;
  onChange: (val: Date | undefined) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-1">
      <span className="text-muted-foreground text-sm font-medium">{label}</span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-[180px] justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "dd/MM/yyyy") : <span>Selecione</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date) => {
              onChange(date ?? undefined);
              setOpen(false);
            }}
            locale={ptBR}
            initialFocus
          />
          {value && (
            <div className="px-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-red-600"
                onClick={() => onChange(undefined)}
              >
                <X className="mr-2 h-4 w-4" />
                Limpar
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
