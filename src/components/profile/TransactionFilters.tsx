
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CalendarIcon, Filter, RotateCcw, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface TransactionFiltersProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  transactionType: string;
  onTransactionTypeChange: (type: string) => void;
  onReset: () => void;
}

const TransactionFilters = ({
  dateRange,
  onDateRangeChange,
  transactionType,
  onTransactionTypeChange,
  onReset
}: TransactionFiltersProps) => {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const {t} = useLanguage();
  const transactionTypes = [
    { value: 'all', label: t('wallet.all_transactions') },
    { value: 'receipts', label: t('wallet.incoming_payments') },
    { value: 'withdrawals', label: t('wallet.withdrawal') }
  ];
  

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      {/* Date Range Filter */}
      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="justify-start text-left font-normal">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "dd/MM/yyyy")} - {format(dateRange.to, "dd/MM/yyyy")}
                </>
              ) : (
                format(dateRange.from, "dd/MM/yyyy")
              )
            ) : (
              t('wallet.select_time_period')
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={onDateRangeChange}
            numberOfMonths={2}
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>

      {/* Transaction Type Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="justify-between min-w-[200px]">
            <div className="flex items-center">
              <Filter className="mr-2 h-4 w-4" />
              {transactionTypes.find(t => t.value === transactionType)?.label}
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {transactionTypes.map((type) => (
            <DropdownMenuItem
              key={type.value}
              onClick={() => onTransactionTypeChange(type.value)}
            >
              {type.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Reset Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onReset}
        className="text-muted-foreground hover:text-foreground"
      >
        <RotateCcw className="mr-2 h-4 w-4" />
        {t('wallet.reset')}
      </Button>
    </div>
  );
};

export default TransactionFilters;
