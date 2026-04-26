"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { ChevronDownIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Generate 30-min interval times: ["00:00", "00:30", "01:00", ..., "23:30"]
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2).toString().padStart(2, "0");
  const m = i % 2 === 0 ? "00" : "30";
  return `${h}:${m}`;
});

type ScheduledPostModalProps = {
  open: boolean;
  setOpenModal: (flag: boolean) => void;
  schedulingPost: boolean;
  onSchedulePost: (scheduledData: string) => void;
};

const ScheduledPostModal = ({
  open,
  setOpenModal,
  schedulingPost,
  onSchedulePost,
}: ScheduledPostModalProps) => {
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState<string | null>(null);
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [openTimePicker, setOpenTimePicker] = useState(false);
  const [errors, setErrors] = useState({ date: "", time: "" });

  const isToday = useMemo(
    () => date && format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd"),
    [date]
  );

  const availableTimes = useMemo(() => {
    const currentTime = format(new Date(), "HH:mm");
    return TIME_OPTIONS.map((t) => ({
      value: t,
      disabled: !!isToday && t <= currentTime,
    }));
  }, [isToday]);

  const handleSchedule = () => {
    if (!date) {
      setErrors({ date: "Please select a date", time: "" });
      return;
    }
    if (!time) {
      setErrors({ date: "", time: "Please select a time" });
      return;
    }

    const [hours, minutes] = time.split(":").map(Number);
    const scheduledDate = new Date(date);
    scheduledDate.setHours(hours, minutes, 0, 0);

    if (scheduledDate <= new Date()) {
      setErrors({ date: "", time: "Please select a future time" });
      return;
    }

    setErrors({ date: "", time: "" });
    onSchedulePost(scheduledDate.toISOString());
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    setDate(selectedDate);
    setTime(null);
    setErrors((prev) => ({ ...prev, date: "" }));
    setOpenDatePicker(false);
  };

  const handleTimeSelect = (value: string) => {
    setTime(value);
    setErrors((prev) => ({ ...prev, time: "" }));
    setOpenTimePicker(false);
  };

  const isPastDate = (d: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d < today;
  };

  return (
    <Dialog open={open} onOpenChange={setOpenModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule your post</DialogTitle>
          <DialogDescription>
            Choose a date and time to publish your post.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Date Picker */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Date</label>
            <Popover open={openDatePicker} onOpenChange={setOpenDatePicker}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="lg"
                  className={cn(
                    "w-full justify-between font-normal",
                    errors.date && "border-red-500"
                  )}
                >
                  {date ? format(date, "PPP") : "Select date"}
                  <ChevronDownIcon className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  defaultMonth={date}
                  captionLayout="dropdown"
                  onSelect={handleDateSelect}
                  disabled={isPastDate}
                />
              </PopoverContent>
            </Popover>
            {errors.date && (
              <p className="text-xs text-red-500">{errors.date}</p>
            )}
          </div>

          {/* Time Picker */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Time</label>
            <Popover open={openTimePicker} onOpenChange={setOpenTimePicker}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="lg"
                  disabled={!date}
                  className={cn(
                    "w-full justify-between font-normal",
                    errors.time && "border-red-500"
                  )}
                >
                  {time ?? "Select time"}
                  <ChevronDownIcon className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] p-0"
                align="start"
              >
                <div
                  className="grid grid-cols-4 gap-1.5 p-2 overflow-y-auto"
                  style={{ maxHeight: "240px" }}
                  onWheel={(e) => e.stopPropagation()}
                >
                  {availableTimes.map(({ value, disabled }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => !disabled && handleTimeSelect(value)}
                      disabled={disabled}
                      className={cn(
                        "px-2 py-1.5 rounded-md text-sm font-medium transition-colors",
                        time === value && !disabled
                          ? "bg-foreground text-background"
                          : !disabled && "hover:bg-muted text-foreground",
                        disabled &&
                          "text-muted-foreground/40 line-through cursor-not-allowed bg-muted/30"
                      )}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            {errors.time && (
              <p className="text-xs text-red-500">{errors.time}</p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setOpenModal(false)}
            disabled={schedulingPost}
          >
            Cancel
          </Button>
          <Button onClick={handleSchedule} disabled={schedulingPost}>
            {schedulingPost ? "Scheduling..." : "Schedule Post"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduledPostModal;
