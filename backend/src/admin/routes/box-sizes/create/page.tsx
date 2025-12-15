import { Heading, Container, Button, Input, Label } from "@medusajs/ui"
import { useForm } from "react-hook-form"
import { sdk } from "../../../lib/sdk"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"

type BoxSizeForm = {
    name: string
    length: number
    width: number
    height: number
    weight_limit: number
}

const CreateBoxSize = () => {
    const { register, handleSubmit } = useForm<BoxSizeForm>()
    const navigate = useNavigate()
    const [saving, setSaving] = useState(false)
    const queryClient = useQueryClient()

    const onSubmit = async (data: BoxSizeForm) => {
        setSaving(true)
        try {
            await sdk.client.fetch("/admin/box-sizes", {
                method: "POST",
                body: {
                    ...data,
                    length: Number(data.length),
                    width: Number(data.width),
                    height: Number(data.height),
                    weight_limit: Number(data.weight_limit)
                }
            })

            // Invalidate the list query
            queryClient.invalidateQueries({ queryKey: ["box-sizes"] })

            navigate("/box-sizes")
        } catch (e) {
            console.error(e)
            alert("Failed to create box size")
        } finally {
            setSaving(false)
        }
    }

    return (
        <Container className="max-w-lg mt-8 mx-auto">
            <Heading level="h1" className="mb-4">Create Box Size</Heading>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <Label>Name</Label>
                    <Input {...register("name", { required: true })} placeholder="Small Box" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col gap-2">
                        <Label>Length (cm)</Label>
                        <Input type="number" step="0.1" {...register("length", { required: true })} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label>Width (cm)</Label>
                        <Input type="number" step="0.1" {...register("width", { required: true })} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label>Height (cm)</Label>
                        <Input type="number" step="0.1" {...register("height", { required: true })} />
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <Label>Weight Limit (lbs)</Label>
                    <Input type="number" step="0.1" {...register("weight_limit", { required: true })} defaultValue={20} />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="secondary" onClick={() => navigate("/box-sizes")} type="button">Cancel</Button>
                    <Button type="submit" isLoading={saving}>Create</Button>
                </div>
            </form>
        </Container>
    )
}

export default CreateBoxSize
