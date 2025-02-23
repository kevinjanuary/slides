import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { Slide } from "~/types/slide"

const dummySlides = [
  {
    value: "const isExample = animations.some(() => {})",
  },
  {
    value: `const isExample = animations.some((animation) => {
  return animation.looksAwesome()
})`,
  },
]

interface SlideState {
  slides: Slide[]
  currentSlide: number
  isPresentationMode: boolean
  setSlides: (slides: Slide[]) => void
  setCurrentSlide: (index: number) => void
  addSlide: () => void
  updateSlide: (index: number, value: string) => void
  deleteSlide: (index: number) => void
  nextSlide: () => void
  previousSlide: () => void
  setIsPresentationMode: (value: boolean) => void
}

export const useSlideStore = create<SlideState>()(
  persist(
    (set) => ({
      slides: dummySlides,
      currentSlide: 0,
      isPresentationMode: false,
      setSlides: (slides) => set({ slides }),
      setCurrentSlide: (currentSlide) => set({ currentSlide }),
      addSlide: () =>
        set((state) => {
          const newSlides = [...state.slides, { value: "" }]
          return {
            slides: newSlides,
            currentSlide: newSlides.length - 1,
          }
        }),
      updateSlide: (index, value) =>
        set((state) => ({
          slides: state.slides.map((slide, i) =>
            i === index ? { ...slide, value } : slide
          ),
        })),
      deleteSlide: (index) =>
        set((state) => {
          const newSlides = state.slides.filter((_, i) => i !== index)
          return {
            slides: newSlides,
            currentSlide:
              state.currentSlide >= index
                ? Math.max(0, state.currentSlide - 1)
                : state.currentSlide,
          }
        }),
      nextSlide: () =>
        set((state) => ({
          currentSlide: Math.min(
            state.currentSlide + 1,
            state.slides.length - 1
          ),
        })),
      previousSlide: () =>
        set((state) => ({
          currentSlide: Math.max(0, state.currentSlide - 1),
        })),
      setIsPresentationMode: (isPresentationMode) =>
        set({ isPresentationMode }),
    }),
    {
      name: "slides-storage", // unique name for localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ slides: state.slides }), // only persist slides
    }
  )
)
