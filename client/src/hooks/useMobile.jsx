"use client"
import React, { useEffect, useState } from "react";

const useMobile = (breakpoint = 768) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const mediaQuery = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
        setIsMobile(mediaQuery.matches);

        const onChange = (event) => {
            setIsMobile(event.matches);
        };

        mediaQuery.addEventListener('change', onChange);
        return () => {
            mediaQuery.removeEventListener('change', onChange);
        };
    }, [breakpoint]);

    return [isMobile];
};

export default useMobile;