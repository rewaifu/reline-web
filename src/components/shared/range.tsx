"use client"

import { cn } from "@/lib/utils"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"



const Slider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>>(
  ({ className, ...props }, ref) => (
    <div className="group w-full touch-none select-none transition-[margin] *:duration-300 hover:cursor-grab active:cursor-grabbing">
      <SliderPrimitive.Root ref={ref} className={cn("relative flex h-2 w-full items-center transition-[height] duration-300", className)} {...props}>
        <SliderPrimitive.Track className="h-7 w-full grow overflow-hidden rounded-md bg-white/5 dark:bg-dark-supertransparent">
          <SliderPrimitive.Range className="absolute transition-colors duration-200 ease-out rounded-md rounded-tr-none rounded-br-none h-7 bg-white/10 group-hover:bg-white/20 dark:bg-white/10" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block h-7 w-3 rounded-[3px] bg-[#bdbdbd] outline-none transition-[height] group-hover:bg-[#ededed] dark:bg-[#dcdcdc] disabled:pointer-events-none disabled:opacity-50" />
      </SliderPrimitive.Root>
    </div>
  ),
)
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
