import React, { useState, useEffect, useCallback } from "react";
import "./imageSlideShow.css";

interface Slide {
    id: number;
    image: string;
    title?: string;
    description?: string;
}

interface ImageSlideShowProps {
    slides?: Slide[];
    autoPlayInterval?: number;
    showControls?: boolean;
    showIndicators?: boolean;
}

const defaultSlides: Slide[] = [
    {
        id: 1,
        image: "../../public/chat.png",
        title: "AI-Powered Knowledge",
        description: "Ask anything and get instant answers",
    },
    {
        id: 2,
        image: "../../public/upload-file.png",
        title: "Upload & Index",
        description: "The Files stored in Vector Database",
    },
];

const ImageSlideShow: React.FC<ImageSlideShowProps> = ({
    slides = defaultSlides,
    autoPlayInterval = 5000,
    showControls = false,
    showIndicators = false,
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);

    const goToSlide = useCallback((index: number) => {
        setCurrentIndex(index);
    }, []);

    const goToPrevious = useCallback(() => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? slides.length - 1 : prevIndex - 1,
        );
    }, [slides.length]);

    const goToNext = useCallback(() => {
        setCurrentIndex((prevIndex) =>
            prevIndex === slides.length - 1 ? 0 : prevIndex + 1,
        );
    }, [slides.length]);

    useEffect(() => {
        if (!isPlaying || slides.length <= 1) return;

        const interval = setInterval(() => {
            goToNext();
        }, autoPlayInterval);

        return () => clearInterval(interval);
    }, [isPlaying, goToNext, autoPlayInterval, slides.length]);

    if (!slides || slides.length === 0) {
        return <div className="slideshow-empty">No slides available</div>;
    }

    return (
        <div
            className="slideshow-container"
            onMouseEnter={() => setIsPlaying(false)}
            onMouseLeave={() => setIsPlaying(true)}
        >
            {/* Slides */}
            <div className="slideshow-wrapper">
                {slides.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={`slide ${index === currentIndex ? "active" : ""}`}
                        style={{
                            transform: `translateX(${(index - currentIndex) * 100}%)`,
                        }}
                    >
                        <img
                            src={slide.image}
                            alt={slide.title || `Slide ${index + 1}`}
                            className="slide-image"
                        />
                        {(slide.title || slide.description) && (
                            <div className="slide-content">
                                {slide.title && (
                                    <h2 className="slide-title">
                                        {slide.title}
                                    </h2>
                                )}
                                {slide.description && (
                                    <p className="slide-description">
                                        {slide.description}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Navigation Controls */}
            {showControls && slides.length > 1 && (
                <>
                    <button
                        className="slide-control prev"
                        onClick={goToPrevious}
                        aria-label="Previous slide"
                    >
                        &#10094;
                    </button>
                    <button
                        className="slide-control next"
                        onClick={goToNext}
                        aria-label="Next slide"
                    >
                        &#10095;
                    </button>
                </>
            )}

            {/* Indicators */}
            {showIndicators && slides.length > 1 && (
                <div className="slide-indicators">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            className={`indicator ${index === currentIndex ? "active" : ""}`}
                            onClick={() => goToSlide(index)}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ImageSlideShow;
