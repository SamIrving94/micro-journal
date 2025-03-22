'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { DayPicker } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { Button } from '@/app/components/ui/atoms/Button'

// Import the styles
import 'react-day-picker/dist/style.css'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          "hover:bg-clay-100",
          "h-7 w-7 bg-transparent p-0"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-gray-500 rounded-md w-8 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
          "first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
        ),
        day: cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          "hover:bg-clay-100 hover:text-gray-900",
          "aria-selected:bg-orange-600 aria-selected:text-white"
        ),
        day_selected: "bg-orange-600 text-white hover:bg-orange-600 hover:text-white",
        day_today: "bg-clay-100 text-gray-900",
        day_outside: "text-gray-400 opacity-50",
        day_disabled: "text-gray-400 opacity-50",
        day_range_middle: "aria-selected:bg-clay-100",
        day_hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  )
} 