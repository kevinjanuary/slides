import { nanoid } from "nanoid"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { Slide } from "~/types/slide"

const dummySlides: Slide[] = [
  {
    id: "demo-1",
    type: "code",
    title: "Code Example",
    steps: [
      { value: "const example = () => {}" },
      { value: "const example = () => {\n  return 'Hello'\n}" },
    ],
    currentStep: 0,
  },
  {
    id: "demo-2",
    type: "text",
    content: "# Welcome to the Presentation\n\nThis is a text slide example.",
  },
  {
    id: "demo-3",
    type: "image",
    url: "https://source.unsplash.com/random/800x600",
    caption: "A random image example",
  },
]

interface SlideState {
  slides: Slide[]
  currentSlideIndex: number
  isPresentationMode: boolean
  setSlides: (slides: Slide[]) => void
  setCurrentSlideIndex: (index: number) => void
  addSlide: (type: "code" | "text" | "image") => void
  updateCodeSlide: (slideId: string, step: number, value: string) => void
  addCodeStep: (slideId: string) => void
  removeCodeStep: (slideId: string, stepIndex: number) => void
  nextStep: () => void
  previousStep: () => void
  deleteSlide: (index: number) => void
  setIsPresentationMode: (value: boolean) => void
  setCurrentStep: (slideId: string, step: number) => void
}

export const useSlideStore = create<SlideState>()(
  persist(
    (set) => ({
      slides: dummySlides,
      currentSlideIndex: 0,
      isPresentationMode: false,
      setSlides: (slides) => set({ slides }),
      setCurrentSlideIndex: (currentSlideIndex) => set({ currentSlideIndex }),
      addSlide: (type) =>
        set((state) => {
          const newSlide: Slide =
            type === "code"
              ? {
                  id: nanoid(),
                  type: "code",
                  steps: [{ value: "" }],
                  currentStep: 0,
                }
              : type === "text"
              ? {
                  id: nanoid(),
                  type: "text",
                  content: "",
                }
              : {
                  id: nanoid(),
                  type: "image",
                  url: "",
                }

          return {
            slides: [...state.slides, newSlide],
            currentSlideIndex: state.slides.length,
          }
        }),
      updateCodeSlide: (slideId, step, value) =>
        set((state) => ({
          slides: state.slides.map((slide) =>
            slide.id === slideId && slide.type === "code"
              ? {
                  ...slide,
                  steps: slide.steps.map((s, i) =>
                    i === step ? { ...s, value } : s
                  ),
                }
              : slide
          ),
        })),
      addCodeStep: (slideId) =>
        set((state) => ({
          slides: state.slides.map((slide) =>
            slide.id === slideId && slide.type === "code"
              ? {
                  ...slide,
                  steps: [
                    ...slide.steps,
                    { value: slide.steps[slide.steps.length - 1].value },
                  ],
                  currentStep: slide.steps.length,
                }
              : slide
          ),
        })),
      removeCodeStep: (slideId, stepIndex) =>
        set((state) => ({
          slides: state.slides.map((slide) =>
            slide.id === slideId &&
            slide.type === "code" &&
            slide.steps.length > 1
              ? {
                  ...slide,
                  steps: slide.steps.filter((_, i) => i !== stepIndex),
                  currentStep: Math.min(
                    slide.currentStep,
                    slide.steps.length - 2
                  ),
                }
              : slide
          ),
        })),
      nextStep: () =>
        set((state) => {
          const currentSlide = state.slides[state.currentSlideIndex]
          if (currentSlide?.type === "code") {
            if (currentSlide.currentStep < currentSlide.steps.length - 1) {
              return {
                slides: state.slides.map((slide, i) =>
                  i === state.currentSlideIndex && slide.type === "code"
                    ? { ...slide, currentStep: slide.currentStep + 1 }
                    : slide
                ),
              }
            }
          }
          return {
            currentSlideIndex: Math.min(
              state.currentSlideIndex + 1,
              state.slides.length - 1
            ),
          }
        }),
      previousStep: () =>
        set((state) => {
          const currentSlide = state.slides[state.currentSlideIndex]
          if (currentSlide?.type === "code" && currentSlide.currentStep > 0) {
            return {
              slides: state.slides.map((slide, i) =>
                i === state.currentSlideIndex && slide.type === "code"
                  ? { ...slide, currentStep: slide.currentStep - 1 }
                  : slide
              ),
            }
          }
          return {
            currentSlideIndex: Math.max(0, state.currentSlideIndex - 1),
          }
        }),
      deleteSlide: (index) =>
        set((state) => ({
          slides: state.slides.filter((_, i) => i !== index),
          currentSlideIndex:
            state.currentSlideIndex >= index
              ? Math.max(0, state.currentSlideIndex - 1)
              : state.currentSlideIndex,
        })),
      setIsPresentationMode: (isPresentationMode) =>
        set({ isPresentationMode }),
      setCurrentStep: (slideId, step) =>
        set((state) => ({
          slides: state.slides.map((slide) =>
            slide.id === slideId && slide.type === "code"
              ? { ...slide, currentStep: step }
              : slide
          ),
        })),
    }),
    {
      name: "slides-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ slides: state.slides }),
    }
  )
)
