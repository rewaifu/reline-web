"use client"

import * as React from "react"
import { Slider as SliderPrimitive } from "@base-ui/react/slider"

import { cn } from "~/lib/utils"

function Slider({
                    className,
                    defaultValue,
                    value,
                    min = 0,
                    max = 100,
                    ...props
                }: SliderPrimitive.Root.Props) {
    const values = React.useMemo(
        () =>
            Array.isArray(value)
                ? value
                : Array.isArray(defaultValue)
                    ? defaultValue
                    : [min],
        [value, defaultValue, min]
    )

    return (
        <SliderPrimitive.Root
            data-slot="slider"
            value={value}
            defaultValue={defaultValue}
            min={min}
            max={max}
            thumbAlignment="edge"
            className={cn(
                "relative flex w-full touch-none select-none items-center",
                className
            )}
            {...props}
        >
            <SliderPrimitive.Control className="relative flex w-full touch-none select-none items-center data-disabled:opacity-50">
                <SliderPrimitive.Track
                    data-slot="slider-track"
                    className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary"
                >
                    <SliderPrimitive.Indicator
                        data-slot="slider-range"
                        className="absolute h-full bg-primary"
                    />
                </SliderPrimitive.Track>

                {values.map((_, index) => (
                    <SliderPrimitive.Thumb
                        key={index}
                        data-slot="slider-thumb"
                        className={cn(
                            "relative block h-5 w-5 rounded-full bg-card",
                            "border-2 border-primary",
                            "ring-ring/30 ring-offset-background",
                            "transition-[border-width,box-shadow] duration-150",
                            "hover:ring-3",
                            "data-[dragging]:ring-0 data-[dragging]:border-[4px]",

                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                            "disabled:pointer-events-none disabled:opacity-50",

                            "after:absolute after:-inset-2"
                        )}
                    />
                ))}
            </SliderPrimitive.Control>
        </SliderPrimitive.Root>
    )
}

export { Slider }