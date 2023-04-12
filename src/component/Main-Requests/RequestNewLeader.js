import React from 'react'
import { Breadcrumb } from 'react-bootstrap'

export default function RequestNewLeader() {
  return (
    <div>
      <Breadcrumb>
        <Breadcrumb.Item active>Request</Breadcrumb.Item>
        <Breadcrumb.Item active>Manage New Leader</Breadcrumb.Item>
      </Breadcrumb>
    </div>  )
}
