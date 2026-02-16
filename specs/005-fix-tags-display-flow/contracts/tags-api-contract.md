# API Contract: Tags Operations

## Overview
This document specifies the API contracts for tags operations in the multi-phase todo application. It defines the endpoints, request/response formats, and error handling for all tags-related functionality.

## Base Path
All endpoints are prefixed with `/api`

## Authentication
All endpoints require authentication via HTTP-only cookies. The authentication token is automatically included in requests by the frontend.

## Endpoints

### GET /tags
Retrieve all tags for the authenticated user.

#### Request
- Method: `GET`
- Path: `/api/tags`
- Headers: 
  - `Content-Type: application/json`
  - `Cookie: access_token=<token>` (automatically included by browser)

#### Response
- Success: `200 OK`
- Body:
```json
{
  "tags": [
    {
      "id": "string",
      "name": "string",
      "color": "string | null",
      "user_id": "string",
      "created_at": "string",
      "updated_at": "string"
    }
  ]
}
```

#### Error Responses
- `401 Unauthorized`: User not authenticated
- `500 Internal Server Error`: Server error

### POST /tags
Create a new tag for the authenticated user.

#### Request
- Method: `POST`
- Path: `/api/tags`
- Headers:
  - `Content-Type: application/json`
  - `Cookie: access_token=<token>`
- Body:
```json
{
  "name": "string",
  "color": "string | null",
  "user_id": "string"
}
```

#### Response
- Success: `200 OK`
- Body:
```json
{
  "id": "string",
  "name": "string",
  "color": "string | null",
  "user_id": "string",
  "created_at": "string",
  "updated_at": "string"
}
```

#### Error Responses
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: User not authenticated
- `422 Unprocessable Entity`: Validation error
- `500 Internal Server Error`: Server error

### GET /tags/{tag_id}
Retrieve a specific tag by ID.

#### Request
- Method: `GET`
- Path: `/api/tags/{tag_id}`
- Headers:
  - `Content-Type: application/json`
  - `Cookie: access_token=<token>`

#### Response
- Success: `200 OK`
- Body:
```json
{
  "id": "string",
  "name": "string",
  "color": "string | null",
  "user_id": "string",
  "created_at": "string",
  "updated_at": "string"
}
```

#### Error Responses
- `401 Unauthorized`: User not authenticated
- `404 Not Found`: Tag not found
- `500 Internal Server Error`: Server error

### PUT /tags/{tag_id}
Update an existing tag.

#### Request
- Method: `PUT`
- Path: `/api/tags/{tag_id}`
- Headers:
  - `Content-Type: application/json`
  - `Cookie: access_token=<token>`
- Body:
```json
{
  "name": "string | null",
  "color": "string | null"
}
```

#### Response
- Success: `200 OK`
- Body:
```json
{
  "id": "string",
  "name": "string",
  "color": "string | null",
  "user_id": "string",
  "created_at": "string",
  "updated_at": "string"
}
```

#### Error Responses
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: User not authenticated
- `404 Not Found`: Tag not found
- `422 Unprocessable Entity`: Validation error
- `500 Internal Server Error`: Server error

### DELETE /tags/{tag_id}
Delete a tag.

#### Request
- Method: `DELETE`
- Path: `/api/tags/{tag_id}`
- Headers:
  - `Content-Type: application/json`
  - `Cookie: access_token=<token>`

#### Response
- Success: `200 OK`
- Body:
```json
{
  "message": "Tag deleted successfully"
}
```

#### Error Responses
- `401 Unauthorized`: User not authenticated
- `404 Not Found`: Tag not found
- `500 Internal Server Error`: Server error

## Common Error Format
All error responses follow this format:
```json
{
  "detail": "Error message"
}
```

## Data Types
- `string`: A string value
- `string | null`: A string value that can be null
- `string | undefined`: A string value that can be undefined
- `id`: A UUID string in the format "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

## Validation Rules
- Tag name: Required, 1-50 characters
- Tag color: Optional, valid hex color code
- User ID: Required, must match authenticated user