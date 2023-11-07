import { z } from "zod"

export enum LatencyOptimizationMode {
    NO_OPTIMIZATION = 0,
    NORMAL_OPTIMIZATION = 1,
    STRONG_OPTIMIZATION = 2,
    MAX_OPTIMIZATION = 3,
    MAX_OPTIMIZATION_WITHOUT_TEXT_NORMALIZATION = 4,
}



export const RequestSchema = z.object({
    text: z.string(),
    voice: z.string().optional(),
    stream: z.coerce.string().transform((value) => value.toLowerCase() === "true"),
    isFake: z.coerce.string().transform((value) => value.toLowerCase() === "true"),
    optimization: z.nativeEnum(LatencyOptimizationMode).default(LatencyOptimizationMode.MAX_OPTIMIZATION)
})
export type RequestType = z.infer<typeof RequestSchema>
