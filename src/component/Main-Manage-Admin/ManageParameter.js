import React from 'react'
import { Breadcrumb } from 'react-bootstrap'

export default function ManageParameter() {
  return (
    <div>
      <Breadcrumb>
        <Breadcrumb.Item active>Admin</Breadcrumb.Item>
        <Breadcrumb.Item active>Manage Parameter</Breadcrumb.Item>
      </Breadcrumb>
    </div>
  )
}
