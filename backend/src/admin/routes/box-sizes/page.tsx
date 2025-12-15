import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { sdk } from "../../lib/sdk"
import { Table } from "@medusajs/ui"
import { Button } from "@medusajs/ui"
import { Link, Outlet } from "react-router-dom"
import { Plus } from "@medusajs/icons"

const BoxSizesList = () => {
  const { data, isLoading, error } = useQuery({
    queryFn: () => sdk.client.fetch("/admin/box-sizes"),
    queryKey: ["box-sizes"],
  })

  if (isLoading) {
    return <Container>Loading...</Container>
  }

  if (error) {
    return <Container>Error loading box sizes</Container>
  }

  const boxSizes = data?.box_sizes || []

  return (
    <Container>
        <div className="flex items-center justify-between mb-4">
            <Heading level="h1">Box Sizes</Heading>
            <Link to="/box-sizes/create">
                <Button variant="secondary">
                    <Plus /> Create
                </Button>
            </Link>
        </div>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>Dimensions (L x W x H)</Table.HeaderCell>
            <Table.HeaderCell>Weight Limit</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {boxSizes.map((box) => (
            <Table.Row key={box.id}>
              <Table.Cell>{box.name}</Table.Cell>
              <Table.Cell>{box.length} x {box.width} x {box.height} cm</Table.Cell>
              <Table.Cell>{box.weight_limit} lbs</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      <Outlet />
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Box Sizes",
  icon: "cube",
})

export default BoxSizesList
