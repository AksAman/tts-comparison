import React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";
type GenericItem = {
  id: string;
  title: string;
};

export interface SelectorProps<T extends GenericItem>
  extends React.ComponentProps<typeof Select> {
  items: T[];
  placeholder?: string;
  onSelectItem?: (item: T) => void;
  value?: string;
  storageKey?: string;
  className?: string;
  id?: string;
}

function GeneralSelector<T extends GenericItem>({
  items,
  onSelectItem,
  value,
  className,
  id,
  ...props
}: SelectorProps<T>) {
  const [valueFromStorage, setValueToStorage] = useLocalStorage<string | null>(
    props.storageKey ?? "",
    null,
  );
  React.useEffect(() => {
    if (value && valueFromStorage === null && props.storageKey) {
      setValueToStorage(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className={className} id={id}>
      <Select
        onValueChange={(id) => {
          const item = items.find((p) => p.id === id);
          if (item) {
            onSelectItem?.(item);
            if (props.storageKey) {
              setValueToStorage(id);
            }
          }
        }}
        defaultValue={value}
        value={value}
        {...props}
      >
        <SelectTrigger className="md:w-[200px]">
          <SelectValue
            className="truncate"
            placeholder={props.placeholder ?? "Select Item"}
          />
        </SelectTrigger>
        <SelectContent className="max-h-36 overflow-y-auto">
          {items.map((item) => {
            return (
              <SelectItem key={item.id} value={item.id} className="truncate">
                {item.title}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

export default GeneralSelector;
