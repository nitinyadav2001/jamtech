import React, { useEffect, useState } from 'react'

export const useScrollCount = () => {

    const [scrollCount, setScrollCount] = useState(0);
    // onscroll color change header.......................................................................
    const handleScroll = () => {
        if (window.scrollY > 0) {
            setScrollCount(window.scrollY);
        } else {
            setScrollCount(0);
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleScrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return { scrollCount, handleScrollToTop };
}