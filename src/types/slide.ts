export type BaseSlide = {
  id: string
  type: string
}

export type CodeStep = {
  value: string
}

export type CodeSlide = BaseSlide & {
  type: "code"
  title?: string
  steps: CodeStep[]
  currentStep: number
}

export type TextSlide = BaseSlide & {
  type: "text"
  content: string
}

export type ImageSlide = BaseSlide & {
  type: "image"
  url: string
  caption?: string
}

export type Slide = CodeSlide | TextSlide | ImageSlide
