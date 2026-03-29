#!/bin/bash

# Make sure you put your valid JWT token here
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoxLCJlbWFpbCI6Imt1bGRlZXBuaXNoYWQuc2luZ2hAZ21haWwuY29tIn0sImlhdCI6MTc3NDc3ODU0MywiZXhwIjoxNzc0ODY0OTQzfQ.jR0zFXzxPNMbhlxcVm0eByUjVSm6mh8X7hjAV8WiXEQ"

curl -X POST http://localhost:3001/geofences \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Restricted Danger Zone",
    "description": "If a vehicle enters this 10.x coordinate zone, fire an alert!",
    "category": "restricted_zone",
    "coordinates": [
        [10.007, 10.007],
        [10.018, 10.007],
        [10.018, 10.018],
        [10.007, 10.018],
        [10.007, 10.007]
    ]
  }'
