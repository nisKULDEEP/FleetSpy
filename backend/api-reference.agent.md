---
name: API Reference
description: "Reference agent containing all backend endpoints, payloads, and parameters for the MapUp backend system."
---

# API Endpoints and Payloads

Here is the complete list of backend endpoints for the MapUp Backend, including their required payloads and parameters.

## 1. Authentication (`/auth`)
*   **POST** `/auth/register`
    *   **Payload:** `{ "email": "user@example.com", "password": "password123" }`
*   **POST** `/auth/login`
    *   **Payload:** `{ "email": "user@example.com", "password": "password123" }`

## 2. Vehicles (`/vehicles`) - *Requires Auth Token*
*   **GET** `/vehicles`
    *   **Query Params:** None
*   **POST** `/vehicles`
    *   **Payload:** 
        ```json
        {
          "vehicle_number": "ABC-123",
          "driver_name": "John Doe",
          "vehicle_type": "Truck",
          "phone": "1234567890"
        }
        ```
*   **POST** `/vehicles/location`
    *   **Payload:** 
        ```json
        {
          "vehicle_id": "veh_1",
          "latitude": 37.7749,
          "longitude": -122.4194,
          "timestamp": "2023-10-27T10:00:00Z"
        }
        ```
*   **GET** `/vehicles/location/:vehicle_id`
    *   **Path Params:** `vehicle_id` (e.g., `veh_1`)

## 3. Geofences (`/geofences`) - *Requires Auth Token*
*   **GET** `/geofences`
    *   **Query Params:** `category` (optional)
*   **POST** `/geofences`
    *   **Payload:** 
        ```json
        {
          "name": "Zone A",
          "description": "Downtown Area",
          "category": "general",
          "coordinates": [[lng1, lat1], [lng2, lat2], [lng3, lat3], [lng4, lat4]] 
        }
        ```
        *(Note: `coordinates` must be a Polygon with minimum 4 points)*

## 4. Alerts (`/alerts`) - *Requires Auth Token*
*   **GET** `/alerts`
    *   **Query Params:** `geofence_id` (optional, e.g., `geo_1`), `vehicle_id` (optional, e.g., `veh_1`)
*   **POST** `/alerts/configure`
    *   **Payload:** 
        ```json
        {
          "geofence_id": "geo_1",
          "vehicle_id": "veh_1", 
          "event_type": "enter" 
        }
        ```
        *(Note: `vehicle_id` is optional)*

## 5. Violations (`/violations`) - *Requires Auth Token*
*   **GET** `/violations/history`
    *   **Query Params:** `vehicle_id` (optional), `geofence_id` (optional), `start_date` (optional), `end_date` (optional), `limit` (optional, default 50, max 500)

## 6. WebSockets (`/ws/alerts`)
*   **URL:** `<base_url>/ws/alerts`
*   **Auth:** Requires JWT token in handshake `auth.token` or headers `x-auth-token`.
